/**
 * @module
 * @description Handler for the /knock command
 */
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { chatCommandHandler } from "./handlers/chatCommandHandler";
import { guildSettingsService } from "../../common/db/guildSettingsService";
import { EventNotStartedError } from "../../common/errors/EventNotStartedError";
import { randomFloat } from "../util/randomNumber";
import { knockEventService } from "../../common/db/knockEventService";
import { TooManyKnocksError } from "../../common/errors/TooManyKnocksError";
import { getDiscordEmbedAuthor } from "../../common/discord/ui/getDiscordEmbedAuthor";
import { getDiscordEmbedTimestamp } from "../../common/discord/ui/getDiscordEmbedTimestamp";
import { Color } from "../../common/Color";
import { sendFulfillmentMessage } from "../util/sendFulfillmentMessage";
import { commandLambdaLogger } from "../util/commandLambdaLogger";
import { discordService } from "../../common/discord/discordService";

export const knockCommand = chatCommandHandler(
  HalloweenCommand.Knock,
  async (interaction) => {
    const {
      guild_id: guildId,
      member: {
        user: { id: userId },
      },
    } = interaction;
    const settings = await guildSettingsService.getGuildSettings(guildId);
    // 1. Check if the event is running
    if (!settings.startDate || settings.startDate > new Date()) {
      throw new EventNotStartedError({
        sourceError: new Error(`Event not yet started`),
        thrownFrom: "knockCommand",
        startDate: settings.startDate,
        endDate: settings.endDate,
      });
    }

    // 2. Check if the user has any knocks left
    const { knocksPerDay, resetTime, winRate } = settings;
    const lastReset = guildSettingsService.getLastReset(settings);
    const knockCount = await knockEventService.getKnockCountSinceLastReset(
      settings,
      userId,
    );
    if (knockCount >= knocksPerDay) {
      throw new TooManyKnocksError({
        guildId,
        userId,
        knocksPerDay,
        resetTime,
        lastResetTime: lastReset,
        sourceError: new Error(
          `User ${userId} attempted to knock. Already knocked ${knockCount} times`,
        ),
        thrownFrom: "knockCommand",
      });
    }

    // 3. Roll for a win
    const roll = randomFloat();
    commandLambdaLogger.info({
      winRate,
      roll,
      userId,
      guildId,
      win: roll <= winRate,
    });
    if (randomFloat() > winRate) {
      await knockEventService.saveKnockEvent({
        guildId,
        userId,
        prizeId: null,
      });
      await discordService.updateInteractionResponse(interaction, {
        embeds: [
          {
            title: "No one was home",
            description:
              "You knocked and knocked but no one was home. Tricks this time.",
            author: getDiscordEmbedAuthor(),
            timestamp: getDiscordEmbedTimestamp(),
            color: Color.Primary,
            footer: {
              text: "Come back soon!",
            },
          },
        ],
      });
    } else {
      // This is a win, save a partial knock event and send a message to the fulfillment queue
      const result = await knockEventService.saveKnockEvent({
        guildId,
        userId,
        prizeId: null,
        isPending: true,
      });
      await sendFulfillmentMessage(interaction, result.id);
      commandLambdaLogger.info({
        message: `Sent fulfillment message for knock event ${result.id}`,
        knockEventId: result.id,
        interactionId: interaction.id,
      });
    }
  },
);
