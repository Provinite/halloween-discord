import {
  APIChatInputApplicationCommandGuildInteraction,
  APIUserApplicationCommandGuildInteraction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from "discord-api-types/v9";
import { Color } from "../../common/Color";
import { knex } from "../../common/db/client";
import {
  giftyService,
  isGiftyRateLimitError,
} from "../../common/db/giftyService";
import { discordService } from "../../common/discord/discordService";
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { hasPermissionFlag } from "../../common/discord/hasPermissionFlag";
import { isGuildChatCommandInteraction } from "../../common/discord/isChatCommandInteraction";
import { isUserGuildCommandInteraction } from "../../common/discord/isUserGuildCommandInteraction";
import { getDiscordEmbedAuthor } from "../../common/discord/ui/getDiscordEmbedAuthor";
import { getDiscordEmbedTimestamp } from "../../common/discord/ui/getDiscordEmbedTimestamp";
import { getErrorDiscordEmbedFooter } from "../../common/errors/util/getErrorDiscordEmbedFooter";
import { ValidationError } from "../../common/errors/ValidationError";
import { HalloweenDiscordError } from "../errors/HalloweenDiscordError";
import { chatOrUserCommandHandler } from "./handlers/chatOrUserCommandHandler";

export const giftyCommand = chatOrUserCommandHandler(
  HalloweenCommand.Gifty,
  async (interaction) => {
    await knex().transaction(async (tx) => {
      const {
        guild_id: guildId,
        member: {
          user: { id: fromUserId },
        },
      } = interaction;
      const toUserId = getToUserId(interaction);

      try {
        await giftyService.saveGifty(
          {
            guildId,
            fromUserId,
            toUserId,
          },
          {
            rateLimit: !hasPermissionFlag(
              interaction.member.permissions,
              PermissionFlagsBits.Administrator,
            ),
          },
          tx,
        );
      } catch (err) {
        if (err instanceof ValidationError && isGiftyRateLimitError(err)) {
          await discordService.updateInteractionResponse(interaction, {
            embeds: [
              {
                author: getDiscordEmbedAuthor(),
                timestamp: getDiscordEmbedTimestamp(),
                color: Color.Error,
                title: "Cloverse Halloween 2021 - Gifty Already Sent",
                description:
                  "You have already sent a gifty since the last reset. Try again soon!",
                footer: getErrorDiscordEmbedFooter(),
              },
            ],
          });
          return;
        } else {
          throw err;
        }
      }
      await discordService.updateInteractionResponse(interaction, {
        allowed_mentions: {
          users:
            fromUserId === toUserId ? [fromUserId] : [fromUserId, toUserId],
        },
        embeds: [
          {
            author: getDiscordEmbedAuthor(),
            timestamp: getDiscordEmbedTimestamp(),
            color: Color.Primary,
            title: "Cloverse Halloween 2021 - New Gifty!",
            description: `<@${fromUserId}> is spreading the love! They just sent a one-time-use extra knock to a lucky friend.`,
            fields: [{ name: "Recipient", value: `<@${toUserId}>` }],
          },
        ],
      });
    });
  },
);

function getToUserId(
  interaction:
    | APIUserApplicationCommandGuildInteraction
    | APIChatInputApplicationCommandGuildInteraction,
): string {
  let toUserId: string;
  if (isGuildChatCommandInteraction(interaction)) {
    if (!interaction.data.options || !interaction.data.options.length) {
      throw new HalloweenDiscordError({
        thrownFrom: "giftyCommand (chat)",
        message: "No user specified",
        sourceError: new Error(
          "Incoming interaction has no options. Need one for gifty command",
        ),
        errorsLambda: false,
        interaction,
      });
    }
    const [toUser] = interaction.data.options;
    if (toUser.type !== ApplicationCommandOptionType.User) {
      throw new HalloweenDiscordError({
        thrownFrom: "giftyCommand (chat)",
        message: "No user specified",
        sourceError: new Error(
          "Incoming interaction has options, but first option is not of type user. Need one for gifty command",
        ),
        errorsLambda: false,
        interaction,
      });
    }
    toUserId = toUser.value;
  } else if (isUserGuildCommandInteraction(interaction)) {
    toUserId = interaction.data.target_id;
  } else {
    throw new HalloweenDiscordError({
      thrownFrom: "giftyCommand",
      message:
        "Unexpected command type. Gifty can be used as a slash command or by right clicking on a user.",
      sourceError: new Error(
        "The incoming interaction is neither a UserGuildCommand or a GuildChatCommand",
      ),
      errorsLambda: false,
      interaction,
    });
  }

  return toUserId;
}
