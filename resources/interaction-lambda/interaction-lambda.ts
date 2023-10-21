import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { getHeader } from "./getHeader";
import { SignatureHeaders } from "./SignatureHeaders";
import { apiGatewayResult } from "../common/lambda/apiGatewayResult";
import {
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseDeferredChannelMessageWithSource,
  APIInteractionResponsePong,
  InteractionResponseType,
  MessageFlags,
} from "discord-api-types/v9";
import { verifyDiscordInteraction } from "./discord/verifyDiscordInteraction";
import { isApplicationCommandGuildInteraction } from "discord-api-types/utils/v9";
import { isPingInteraction } from "./discord/isPingInteraction";
import { parseBody } from "../common/lambda/parseBody";
import { isApplicationCommandInteraction } from "./discord/isApplicationCommandInteraction";
import { Lambda } from "aws-sdk";
import { envService } from "../common/envService";
import { logger } from "../common/Logger";
import { captureAWSClient } from "aws-xray-sdk-core";
import { HalloweenCommand } from "../common/discord/HalloweenCommand";
const lambda = captureAWSClient(new Lambda());

const actualHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  logger.info({
    source: "interaction-lambda",
    message: "Lambda invoked",
    event,
  });

  const signature = getHeader(event.headers, SignatureHeaders.Signature);
  const timestamp = getHeader(event.headers, SignatureHeaders.Timestamp);
  const rawBody = event.body || "";

  // Verify signature
  if (!verifyDiscordInteraction(timestamp, rawBody, signature)) {
    logger.error({
      message: "Invalid request signature",
    });
    return apiGatewayResult({
      statusCode: 401,
      body: {
        error: {
          message: "Invalid request, invalid request signature",
        },
      },
    });
  }
  const body = parseBody(event.body);
  if (!body) {
    return apiGatewayResult({
      statusCode: 400,
      body: {
        error: {
          message: "Invalid request body",
        },
      },
    });
  }
  if (isPingInteraction(body)) {
    return apiGatewayResult<APIInteractionResponsePong>({
      statusCode: 200,
      body: {
        type: InteractionResponseType.Pong,
      },
    });
  } else if (isApplicationCommandInteraction(body)) {
    if (isApplicationCommandGuildInteraction(body)) {
      setTimeout(() => {
        logger.info({
          message: "Launching command lambda!",
        });
        // Floating promises are okay here
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        lambda
          .invoke({
            FunctionName: envService.getCommandLambdaArn(),
            Payload: JSON.stringify({ body }),
            InvocationType: "Event",
          })
          .promise()
          .then(() => {
            logger.info("Command lambda successfully fired");
          });
      });
      return apiGatewayResult<APIInteractionResponseDeferredChannelMessageWithSource>(
        {
          statusCode: 200,
          body: {
            data: {
              flags:
                body.data.name === HalloweenCommand.DeviantArt
                  ? MessageFlags.Ephemeral
                  : undefined,
            },
            type: InteractionResponseType.DeferredChannelMessageWithSource,
          },
        },
      );
    } else {
      return apiGatewayResult<APIInteractionResponseChannelMessageWithSource>({
        statusCode: 200,
        body: {
          data: {
            flags: MessageFlags.Ephemeral,
            content: "This command may only be used in a guild.",
          },
          type: InteractionResponseType.ChannelMessageWithSource,
        },
      });
    }
  } else {
    return apiGatewayResult({
      statusCode: 400,
      body: {
        error: {
          message: "Bad request, only application commands are supported.",
        },
      },
    });
  }
};

/**
 * This must be a non-async handler to allow for the use of setTimeout to invoke the
 * command lambda AFTER returning the API response. Async handlers end immediately upon returning.
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html
 * @param event
 * @param context
 * @param callback
 */
export const handler = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: (error: Error | null, result?: APIGatewayProxyResult) => void,
): void => {
  new Promise<APIGatewayProxyResult>((resolve, reject) => {
    actualHandler(event).then((result) => {
      logger.info({
        source: "interaction-lambda",
        message: "Lambda completed",
        result,
      });
      resolve(result);
    }, reject);
  }).then(
    (result) => {
      callback(null, result);
    },
    (err) => {
      logger.error({
        message: "Error during invocation",
        error: err,
      });
      callback(err);
    },
  );
};
