/**
 * @module
 * @description Lambda function for processing Fulfillment SQS
 * messages. Selects a prize and notifies the user.
 */
import { SQSEvent } from "aws-lambda";
import { randomElement } from "../command-lambda/util/randomElement";
import { FulfillmentMessageBody } from "../command-lambda/util/sendFulfillmentMessage";
import { Color } from "../common/Color";
import { knex } from "../common/db/client";
import { knockEventService } from "../common/db/knockEventService";
import { prizeService } from "../common/db/prizeService";
import { getClientCredentialsToken } from "../common/discord/getClientCredentialsToken";
import { interactionContext } from "../common/discord/interactionContext";
import { getDiscordEmbedAuthor } from "../common/discord/ui/getDiscordEmbedAuthor";
import { updateInteractionResponse } from "../common/discord/updateInteractionResponse";
import {
  FulfillmentLambdaLogger,
  fulfillmentLambdaLogger,
} from "./FulfillmentLambdaLogger";

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
      await knex().transaction(async (tx) => {
        const prizes = await prizeService.getPrizes(
          (qb) =>
            qb
              .where({ guildId: interaction.guild_id })
              .andWhere("currentStock", ">", 0),
          tx,
        );
        // TODO: Weights
        // TODO: Error handling
        const prize = randomElement(prizes);
        await knockEventService.fulfillPendingKnockEvent(
          knockEventId,
          prize.id,
          tx,
        );
        await prizeService.decrementStock(prize.id, interaction.guild_id, tx);

        // TODO: Error handling is critical here
        messageLogger.info({
          message: "Sending prize response",
          prizeId: prize.id,
          guildId: interaction.guild_id,
          knockEventId,
        });
        await updateInteractionResponse(
          await getClientCredentialsToken(),
          interaction.token,
          {
            embeds: [
              {
                author: getDiscordEmbedAuthor(),
                title: "Winner!",
                description:
                  "You won! Congratulations on your lovely new prize!",
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
          },
        );
      });
    });
  }
};
