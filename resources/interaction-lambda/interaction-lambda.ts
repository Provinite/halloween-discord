import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { sign } from "tweetnacl";
import { envService } from "./EnvService";
import { SignatureHeaders } from "./SignatureHeaders";

export const handler: APIGatewayProxyHandler = async (
  event,
): Promise<APIGatewayProxyResult> => {
  const signature = event.headers[SignatureHeaders.Signature];
  const timestamp = event.headers[SignatureHeaders.Timestamp];
  const rawBody = event.body || "";

  // Verify signature
  if (!signature || !timestamp) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: {
          message:
            'Invalid request, missing signature elements. Requests to this API must be signed with the "X-Signature-Ed25519" and "X-Signature-Timestamp" headers',
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = void 0;
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    body = JSON.parse(event.body!);
  } catch (err) {
    body = void 0;
  }
  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: {
          message: "Invalid request body",
        },
      }),
    };
  }

  // ACK pings
  if (Object.prototype.hasOwnProperty.call(body, "type")) {
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
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify(
          {
            error: {
              message: "Bad request",
            },
          },
          null,
          2,
        ),
      };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      error: {
        message: "Bad request",
      },
    }),
  };
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
