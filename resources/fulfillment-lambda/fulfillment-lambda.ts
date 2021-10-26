/**
 * @module
 * @description Lambda function for processing Fulfillment SQS
 * messages. Selects a prize and notifies the user.
 */
import { SQSEvent } from "aws-lambda";
import { getClientCredentialsToken } from "../common/discord/getClientCredentialsToken";
import { updateInteractionResponse } from "../common/discord/updateInteractionResponse";
import { FulfillmentMessageBody } from "../common/fulfillment/FulfillmentMessageBody";
import { Logger, logger } from "../common/Logger";

/**
 * Lambda entry point
 * @param event SQS event
 */
export const handler = async (event: SQSEvent): Promise<void> => {
  logger.info({
    source: "fulfillment-lambda",
    message: "Lambda invoked",
    event,
    timestamp: new Date().toISOString(),
  });
  const token = await getClientCredentialsToken();

  let i = 0;
  for (const record of event.Records) {
    let messageLogger = new Logger(logger, {
      sqsMessageId: record.messageId,
    });

    messageLogger.info({
      message: `Processing fulfillment ${i++}`,
    });
    const body = JSON.parse(record.body) as FulfillmentMessageBody;
    messageLogger = new Logger(messageLogger, {
      guildId: body.guildId,
      userId: body.userId,
      requestTimestamp: body.requestTimestamp,
    });

    // TODO: Error handling is critical here
    await updateInteractionResponse(token, body.token, {
      content: "You won a cake!",
    });
  }
};
