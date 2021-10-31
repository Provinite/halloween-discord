/**
 * @module
 * @description Lambda function for processing Fulfillment SQS
 * messages. Selects a prize and notifies the user.
 */
import "../common/xray/instrumentOutboundHttps";
import { Context, SQSEvent, SQSRecord } from "aws-lambda";
import { Segment, setSegment, utils } from "aws-xray-sdk-core";
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
import { guildSettingsService } from "../common/db/guildSettingsService";
import { TooManyKnocksError } from "../common/errors/TooManyKnocksError";
import { giftyService } from "../common/db/giftyService";
import {
  APIEmbedField,
  RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v9";
import { getDiscordEmbedTimestamp } from "../common/discord/ui/getDiscordEmbedTimestamp";

/**
 * Lambda entry point
 * @param event SQS event
 */
export const handler = async (
  event: SQSEvent,
  context: Context,
): Promise<void> => {
  const lambdaExecStartTime = new Date().getTime() / 1000;

  fulfillmentLambdaLogger.info({
    message: "Lambda invoked",
    event,
  });

  let i = 0;
  for (const record of event.Records) {
    const lambdaSegment = createLambdaSegment(
      record,
      lambdaExecStartTime,
      context.functionName,
      context.invokedFunctionArn,
      context.awsRequestId,
    );
    setSegment(lambdaSegment);
    try {
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
          const [guildSettings, gifty] = await Promise.all([
            guildSettingsService.getGuildSettings(interaction.guild_id, tx),
            giftyService.getGiftyForKnockEvent(knockEventId, tx),
          ]);
          const knockCount =
            await knockEventService.getKnockCountSinceLastReset(
              guildSettings,
              interaction.member.user.id,
              tx,
            );
          // if there's an associated gifty for the knock event, we don't need to recertify that this fulfillment is :ok_hand:
          if (!gifty) {
            if (knockCount > guildSettings.knocksPerDay) {
              const error = new TooManyKnocksError({
                guildId: interaction.guild_id,
                userId: interaction.member.user.id,
                knocksPerDay: guildSettings.knocksPerDay,
                lastResetTime: guildSettingsService.getLastReset(guildSettings),
                resetTime: guildSettings.resetTime,
                sourceError: new Error(
                  "Pending knock would exceed knocks per day limit during fulfillment.",
                ),
                thrownFrom: "fulfillment-lambda",
                interaction,
              });
              fulfillmentLambdaLogger.error({
                message:
                  "Pending knock would exceed knocks per day if fulfilled. Deleting knock event and notifying user",
                error: {
                  message: error.message,
                  config: error.config,
                  name: error.name,
                },
              });
              await knockEventService.deletePendingKnockEvent(knockEventId, tx);
              fulfillmentLambdaLogger.error({
                message: "Finished deleting knock event.",
              });
              await discordService.updateInteractionResponse(
                interaction,
                error.getDiscordResponseBody(),
              );
              return;
            }
          }

          const prizes = await prizeService.getPrizes(
            (qb) =>
              qb
                .where({ guildId: interaction.guild_id })
                .andWhere("currentStock", ">", 0)
                .forUpdate(),
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
          const fields: APIEmbedField[] = [
            {
              name: "Prize",
              value: prize.name,
            },
          ];
          if (gifty) {
            fields.push({
              name: "Knock Gifted By",
              value: `<@${gifty.fromUserId}> (Go thank them!)`,
            });
          }
          fields.push({
            name: "Remaining Knocks",
            // this might be negative
            value: `${Math.max(0, guildSettings.knocksPerDay - knockCount)}`,
            inline: true,
          });
          fields.push({
            name: "Banked Gifties",
            value:
              "" +
              (await giftyService.getPendingGiftyCount(
                interaction.guild_id,
                interaction.member.user.id,
                tx,
              )),
            inline: true,
          });
          fields.push({
            name: "Winner",
            value: `<@${interaction.member.user.id}>`,
          });

          const message: RESTPostAPIChannelMessageJSONBody = {
            allowed_mentions: {
              users: [interaction.member.user.id],
            },
            embeds: [
              {
                author: getDiscordEmbedAuthor(),
                title: "Winner!",
                description:
                  "You won! Congratulations on your lovely new prize!",
                image: {
                  url: prize.image,
                },
                color: Color.Primary,
                fields,
                timestamp: getDiscordEmbedTimestamp(),
              },
            ],
          };

          await discordService.updateInteractionResponse(interaction, message);
          if (guildSettings.winChannel) {
            await discordService.sendChannelMessage(
              guildSettings.winChannel,
              message,
            );
          }
        });
      });
    } catch (e: any) {
      lambdaSegment.close(e);
      throw e;
    } finally {
      await closeKnex();
    }
    lambdaSegment.close();
  }
};
// https://dev.to/aws-builders/x-ray-tracing-from-sqs-to-lambda-8md
function createLambdaSegment(
  sqsRecord: SQSRecord,
  lambdaExecStartTime: number,
  functionName: string,
  functionArn: string,
  awsRequestId: string,
): Segment {
  const traceHeaderStr = sqsRecord.attributes.AWSTraceHeader;
  const traceData = utils.processTraceData(traceHeaderStr);
  const sqsSegmentEndTime =
    Number(sqsRecord.attributes.ApproximateFirstReceiveTimestamp) / 1000;
  const lambdaSegment = new Segment(
    functionName,
    traceData.root,
    traceData.parent,
  );
  lambdaSegment.origin = "AWS::Lambda::Function";
  lambdaSegment.start_time =
    lambdaExecStartTime - (lambdaExecStartTime - sqsSegmentEndTime);
  lambdaSegment.addPluginData({
    function_arn: functionArn,
    region: sqsRecord.awsRegion,
    request_id: awsRequestId,
  });
  return lambdaSegment;
}
