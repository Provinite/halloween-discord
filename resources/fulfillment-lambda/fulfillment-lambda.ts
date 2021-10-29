/**
 * @module
 * @description Lambda function for processing Fulfillment SQS
 * messages. Selects a prize and notifies the user.
 */
import { SQSEvent } from "aws-lambda";
import { FulfillmentMessageBody } from "../command-lambda/util/sendFulfillmentMessage";
import { Color } from "../common/Color";
import { closeKnex, knex } from "../common/db/client";
import { knockEventService } from "../common/db/knockEventService";
import { prizeService } from "../common/db/prizeService";
import { discordService } from "../common/discord/discordService";
import { interactionContext } from "../common/discord/interactionContext";
import { getDiscordEmbedAuthor } from "../common/discord/ui/getDiscordEmbedAuthor";
import {
  FulfillmentLambdaLogger,
  fulfillmentLambdaLogger,
} from "./FulfillmentLambdaLogger";
import { selectRandomWeightedElement } from "./randomWeightedElement";

/**
 * Lambda entry point
 * @param event SQS event
 */
export const handler = async (event: SQSEvent): Promise<void> => {
  fulfillmentLambdaLogger.info({
    source: "fulfillment-lambda",
    message: "Lambda invoked",
    event,
  });

  let i = 0;
  for (const record of event.Records) {
    const { interaction, knockEventId } = JSON.parse(
      record.body,
    ) as FulfillmentMessageBody;
    await interactionContext.run(interaction, async () => {
      const messageLogger = new FulfillmentLambdaLogger(
        fulfillmentLambdaLogger,
        {
          sqsMessageId: record.messageId,
        },
      );
      messageLogger.info({
        message: `Processing fulfillment ${i++}`,
      });

      // TODO: Move to prizeService method
      await knex().transaction(async (tx) => {
        const prizes = await prizeService.getPrizes(
          (qb) =>
            qb
              .where({ guildId: interaction.guild_id })
              .andWhere("currentStock", ">", 0),
          tx,
        );
        // The prize is selected by weighting the prizes by their current stock * weight
        const weights = prizes.map((p) => p.currentStock * p.weight);
        const prize = selectRandomWeightedElement(prizes, weights);
        await knockEventService.fulfillPendingKnockEvent(
          knockEventId,
          prize.id,
          tx,
        );
        await prizeService.decrementStock(prize.id, interaction.guild_id, tx);

        messageLogger.info({
          message: "Sending prize response",
          prizeId: prize.id,
          guildId: interaction.guild_id,
          knockEventId,
        });
        await discordService.updateInteractionResponse(interaction, {
          embeds: [
            {
              author: getDiscordEmbedAuthor(),
              title: "Winner!",
              description: "You won! Congratulations on your lovely new prize!",
              image: {
                url: "https://images-ext-1.discordapp.net/external/mM2Q4KZfpfLaTv1whLenvx3Mex81_XI3oi1Z1KQOg38/%3Fpreserve_transparency%3DFalse%26size%3D1200x1200%26size_mode%3D4/https/www.dropbox.com/temp_thumb_from_token/s/al91530liz56fuv?width=590&height=590",
              },
              color: Color.Primary,
              fields: [
                {
                  name: "Prize",
                  value: prize.name,
                },
              ],
            },
          ],
        });
        await closeKnex();
      });
    });
  }
};
