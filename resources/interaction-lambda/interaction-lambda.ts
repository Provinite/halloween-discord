import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
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
import { envService } from "./EnvService";

const lambda = new Lambda();

export const handler: APIGatewayProxyHandler = async (
  event,
): Promise<APIGatewayProxyResult> => {
  const signature = getHeader(event.headers, SignatureHeaders.Signature);
  const timestamp = getHeader(event.headers, SignatureHeaders.Timestamp);
  const rawBody = event.body || "";

  // Verify signature
  if (!verifyDiscordInteraction(timestamp, rawBody, signature)) {
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
      await lambda
        .invoke({
          FunctionName: envService.getCommandLambdaArn(),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Payload: JSON.stringify({ body }),
          InvocationType: "Event",
        })
        .promise();
      return apiGatewayResult<APIInteractionResponseDeferredChannelMessageWithSource>(
        {
          statusCode: 200,
          body: {
            type: InteractionResponseType.DeferredChannelMessageWithSource,
            data: {
              flags: MessageFlags.Ephemeral,
            },
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
