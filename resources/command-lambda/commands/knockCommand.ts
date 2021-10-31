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
import { giftyService } from "../../common/db/giftyService";
import { knex } from "../../common/db/client";
import { Gifty } from "../../common/db/RecordType";
import { APIEmbedField } from "discord-api-types/v9";
import { getCandyImageUrl } from "../../common/getCandyImageUrl";

export const knockCommand = chatCommandHandler(
  HalloweenCommand.Knock,
  async (interaction) => {
    const {
      guild_id: guildId,
      member: {
        user: { id: userId },
      },
    } = interaction;
    await knex().transaction(async (tx) => {
      const settings = await guildSettingsService.getGuildSettings(guildId, tx);
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
      let giftyToUse: Gifty | undefined = undefined;
      if (knockCount >= knocksPerDay) {
        giftyToUse = await giftyService.getNextPendingGifty(
          guildId,
          userId,
          (qb) => qb.forUpdate(),
          tx,
        );
        if (giftyToUse) {
          commandLambdaLogger.info({
            message: "Spending gifty to fulfill knock request after limit",
            gifty: giftyToUse,
          });
        } else {
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
      }

      // 3. Roll for a win
      const roll = randomFloat();
      const win = roll <= winRate;
      commandLambdaLogger.info({
        message: "Rolling the dice for a knock",
        winRate,
        roll,
        userId,
        guildId,
        win,
      });
      if (!win) {
        const knockEvent = await knockEventService.saveKnockEvent(
          {
            guildId,
            userId,
            prizeId: null,
          },
          tx,
        );
        if (giftyToUse) {
          giftyToUse = await giftyService.fulfillGifty(
            giftyToUse,
            knockEvent,
            tx,
          );
        }

        const fields: APIEmbedField[] = [];
        if (giftyToUse) {
          fields.push({
            name: "Knock Gifted By",
            value: `<@${giftyToUse.fromUserId}>`,
          });
        }
        fields.push({
          name: "Remaining Knocks",
          // this might be negative if the user has a gifty to fulfill
          value: `${Math.max(0, knocksPerDay - (knockCount + 1))}`,
          inline: true,
        });
        fields.push({
          name: "Banked Gifties",
          value:
            "" + (await giftyService.getPendingGiftyCount(guildId, userId, tx)),
          inline: true,
        });

        await discordService.updateInteractionResponse(interaction, {
          allowed_mentions: {
            users: giftyToUse
              ? giftyToUse.fromUserId === giftyToUse.toUserId
                ? [giftyToUse.fromUserId]
                : [giftyToUse.fromUserId, giftyToUse.toUserId]
              : [userId],
          },
          embeds: [
            {
              title: "No one was home",
              description:
                "You knocked and knocked but no one was home. Tricks this time.",
              fields,
              author: getDiscordEmbedAuthor(),
              timestamp: getDiscordEmbedTimestamp(),
              color: Color.Primary,
              image: { url: getCandyImageUrl() },
              footer: {
                text: "Come back soon!",
              },
            },
          ],
        });
      } else {
        // This is a win, save a partial knock event and send a message to the fulfillment queue
        const knockEvent = await knockEventService.saveKnockEvent(
          {
            guildId,
            userId,
            prizeId: null,
            isPending: true,
          },
          tx,
        );

        if (giftyToUse) {
          giftyToUse = await giftyService.fulfillGifty(
            giftyToUse,
            knockEvent,
            tx,
          );
        }
        await sendFulfillmentMessage(interaction, knockEvent.id);
        commandLambdaLogger.info({
          message: `Sent fulfillment message for knock event ${knockEvent.id}`,
          knockEventId: knockEvent.id,
          gifty: giftyToUse || null,
          interactionId: interaction.id,
        });
      }
    });
    commandLambdaLogger.info({
      message: "Completed knock transaction",
    });
  },
);
