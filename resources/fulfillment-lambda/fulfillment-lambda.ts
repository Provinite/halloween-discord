import { SQSEvent } from "aws-lambda";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  InteractionResponseType,
  RESTPostOAuth2ClientCredentialsResult,
} from "discord-api-types/v9";
import { URLSearchParams } from "url";
import { FulfillmentMessageBody } from "../common/fulfillment/FulfillmentMessageBody";

export const handler = async (event: SQSEvent): Promise<void> => {
  const logger = makeLogger();
  logger.log("info", {
    message: `Started processing fulfillments`,
    recordCount: event.Records.length,
  });

  const appId = process.env.DISCORD_APPLICATION_ID;
  const secret = process.env.DISCORD_CLIENT_SECRET;

  if (!appId) {
    throw new Error("Missing: process.env.DISCORD_APPLICATION_ID");
  }

  if (!secret) {
    throw new Error("Missing: process.env.DISCORD_CLIENT_SECRET");
  }

  const data = new URLSearchParams();
  data.append("grant_type", "client_credentials");
  data.append("scope", "identify");
  // TODO: Make a bot for this
  let response: AxiosResponse<RESTPostOAuth2ClientCredentialsResult>;
  try {
    response = await axios.post<URLSearchParams, AxiosResponse<any>>(
      "https://discord.com/api/oauth2/token",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        auth: {
          username: appId,
          password: secret,
        },
      },
    );
  } catch (err) {
    if (isAxiosError(err)) {
      logger.log("error", {
        message: `Failed communicating with the discord API (${err.name}): ${err.message}`,
        url: err.config.url,
        responseData: err.response?.data,
        requestBody: err.config.data,
      });
    }
    throw err;
  }
  const authHeader = `Bearer ${response.data.access_token}`;

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
    try {
      messageLogger.log("info", {
        message: "Sending final interaction response",
      });
      await axios.patch(
        `https://discord.com/api/webhooks/${appId}/${body.token}/messages/@original`,
        {
          type: InteractionResponseType.ChannelMessageWithSource,
          content: "You won a cake!",
          flags: 0,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
        },
      );
    } catch (err) {
      if (isAxiosError(err)) {
        messageLogger.log("error", {
          message: `Failed communicating with the discord API (${err.name}): ${err.message}`,
          url: err.config.url,
          responseData: err.response?.data,
          requestBody: err.config.data,
        });
      } else if (err) {
        const errAny = err as any;
        messageLogger.log("error", {
          message: `Failed fulfillment: ${errAny.message}`,
          errorName: errAny.name,
          stack: errAny.stack,
        });
        throw err;
      } else {
        throw new Error("Unknwon failure during fulfillment");
      }
    }
  }
};

function isAxiosError(e: any): e is AxiosError {
  return Boolean(e.isAxiosError);
}

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
