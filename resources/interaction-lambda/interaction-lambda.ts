import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { sign } from "tweetnacl";
import { envService } from "./EnvService";
import { getHeader } from "./getHeader";
import { SignatureHeaders } from "./SignatureHeaders";
import { sendFulfillmentMessage } from "./fulfillment";
import { apiGatewayResult } from "./lambda/apiGatewayResult";
import {
  APIInteractionResponseDeferredChannelMessageWithSource,
  InteractionResponseType,
} from "discord-api-types/v9";

export const handler: APIGatewayProxyHandler = async (
  event,
): Promise<APIGatewayProxyResult> => {
  const requestTime = event.requestContext.requestTimeEpoch;

  const signature = getHeader(event.headers, SignatureHeaders.Signature);
  const timestamp = getHeader(event.headers, SignatureHeaders.Timestamp);
  const rawBody = event.body || "";

  // Verify signature
  if (!signature || !timestamp) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: {
          message: `Invalid request, missing signature elements. Requests to this API must be signed with the "${SignatureHeaders.Signature}" and "${SignatureHeaders.Timestamp}" headers`,
        },
      }),
    };
  }

  if (!isVerified(timestamp, rawBody, signature)) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: {
          message: "Invalid request, invalid request signature",
        },
      }),
    };
  }

  let body: any = undefined;
  try {
    if (!event.body) {
      body = {};
    } else {
      body = JSON.parse(event.body);
    }
  } catch (err) {
    body = undefined;
  }
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

  // ACK pings
  if (body.type === 1) {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          type: 1,
        },
        null,
        2,
      ),
    };
  }

  // Actual interaction handling
  // TODO: validate interaction body
  await sendFulfillmentMessage(body, requestTime);
  return apiGatewayResult<APIInteractionResponseDeferredChannelMessageWithSource>(
    {
      statusCode: 200,
      body: {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      },
    },
  );
};

function isVerified(timestamp: string, body: string, signature: string) {
  try {
    return sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, "hex"),
      envService.getDiscordPublicKey(),
    );
  } catch (err) {
    return false;
  }
}
