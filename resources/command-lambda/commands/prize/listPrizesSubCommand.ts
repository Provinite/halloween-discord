import {
  commandStructure,
  HalloweenCommand,
} from "../../../common/discord/HalloweenCommand";
import { APIEmbed } from "discord-api-types/v9";
import { chatSubcommandHandler } from "../handlers/chatSubcommandHandler";
import { vagueNumberName } from "../../util/vagueNumberName";
import { randomElement } from "../../util/randomElement";
import { prizeService } from "../../../common/db/prizeService";
import { Color } from "../../../common/Color";
import { getDiscordEmbedTimestamp } from "../../../common/discord/ui/getDiscordEmbedTimestamp";
import { discordService } from "../../../common/discord/discordService";
import { getDiscordEmbedAuthor } from "../../../common/discord/ui/getDiscordEmbedAuthor";

const remainingSynonyms = [
  "remaining",
  "left",
  "to go",
  "eagerly awaiting delivery",
  "left to treat",
  "still to be won",
  "still in the back room",
  "left in the closet",
  "tucked away under the cupboard",
  "left in reserve",
  "waiting for a home",
];

/**
 * Subcommand for listing all prizes.
 * @example
 * list
 */
export const listPrizesSubCommand = chatSubcommandHandler(
  {
    subCommandName: commandStructure[HalloweenCommand.Prize].List,
    requiredPermissions: null,
  },
  async (subCommand, interaction) => {
    const prizes = await prizeService.getPrizes((qb) =>
      qb
        .where({ guildId: interaction.guild_id })
        .andWhere("currentStock", ">", 0),
    );

    const baseEmbed = {
      author: getDiscordEmbedAuthor(),
      color: Color.Primary,
      title: "Cloverse Halloween 2021 - Prize List",
      timestamp: getDiscordEmbedTimestamp(),
    };

    // TODO: Handling for > 250 prizes
    // TODO: Probably showing at least some images somehow?
    const prizeEmbeds: APIEmbed[] = [
      {
        ...baseEmbed,
        description:
          "These are the remaining prizes still to go for the event." +
          " Each prize has a different stock and likelyhood of" +
          " being given out (weight) per win. We intend to give out all of" +
          " the prizes before the event ends!",
        fields: [],
      },
    ];
    let prizeIndex = 0;
    let embedIndex = 0;
    let prizeImages: string[] = [];
    for (const prize of prizes) {
      prizeEmbeds[embedIndex].fields!.push({
        name: prize.name,
        value: `${capitalizeFirstLetter(
          vagueNumberName(prize.currentStock),
        )} ${randomElement(remainingSynonyms)} || stock ${
          prize.currentStock
        } | weight: ${prize.weight} ||`,
      });
      prizeImages.push(prize.image);
      // embeds are capped at 25 fields
      if (
        (prizeIndex && prizeIndex % 24 === 0) ||
        prizeIndex === prizes.length - 1
      ) {
        prizeEmbeds[embedIndex].image = {
          url: randomElement(prizeImages),
        };
        if (prizeIndex !== prizes.length - 1) {
          prizeEmbeds.push({
            ...baseEmbed,
            fields: [],
          });
          embedIndex++;
          prizeImages = [];
        }
      }
      prizeIndex++;
    }
    await discordService.updateInteractionResponse(interaction, {
      embeds: prizeEmbeds,
    });
  },
);

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
