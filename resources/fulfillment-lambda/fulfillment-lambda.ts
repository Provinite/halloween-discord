import { SQSEvent } from "aws-lambda";
import { getClientCredentialsToken } from "../common/discord/getClientCredentialsToken";
import { updateInteractionResponse } from "../common/discord/updateInteractionResponse";
import { FulfillmentMessageBody } from "../common/fulfillment/FulfillmentMessageBody";

export const handler = async (event: SQSEvent): Promise<void> => {
  const logger = makeLogger();
  logger.log("info", {
    message: `Started processing fulfillments`,
    recordCount: event.Records.length,
  });
  const token = await getClientCredentialsToken();

  let i = 0;
  for (const record of event.Records) {
    let messageLogger = logger.makeLogger({
      sqsMessageId: record.messageId,
    });
    messageLogger.log("info", {
      message: `Processing fulfillment ${i++}`,
    });
    const body = JSON.parse(record.body) as FulfillmentMessageBody;
    messageLogger = messageLogger.makeLogger({
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

function makeLogger<T = Record<string, unknown>>(baseLog?: T) {
  return {
    log: function <T>(level: "info" | "error", logObject: T) {
      console[level](JSON.stringify({ ...baseLog, ...logObject }, null, 2));
    },
    makeLogger<T = Record<string, unknown>>(baseLogAdditions: T) {
      return makeLogger({ ...(baseLog || {}), ...baseLogAdditions });
    },
  };
}
