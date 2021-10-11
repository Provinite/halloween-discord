import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { sign } from "tweetnacl";
import { envService } from "./EnvService";
import { getHeader } from "./getHeader";
import { SignatureHeaders } from "./SignatureHeaders";
import { APIEmbed } from "discord-api-types/v9";

export const handler: APIGatewayProxyHandler = async (
  event,
): Promise<APIGatewayProxyResult> => {
  const signature = getHeader(event.headers, SignatureHeaders.Signature);
  const timestamp = getHeader(event.headers, SignatureHeaders.Timestamp);
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
    }
  }

  // Actual interaction handling
  const mlems = [
    "https://media3.giphy.com/media/SewaEY6yMH6x2/giphy.gif?cid=ecf05e47rw9eitdat1xijln1vrmzkwk4dr0yh4k54vmcgwws&rid=giphy.gif&ct=g",
    "https://media3.giphy.com/media/tLlxTBISxpxTy/giphy.gif?cid=ecf05e476uwcg4zznhmdm5wjjvxlidqa8hjfmikn3ll7jak7&rid=giphy.gif&ct=g",
    "https://media2.giphy.com/media/FofG9oBDyPYxG/giphy.gif?cid=ecf05e476yqlie2cdbiw14np44xs0mlcpnjdj1s800ccayzf&rid=giphy.gif&ct=g",
    "https://media3.giphy.com/media/1oFpWXV1My9mhmBmaz/giphy.gif?cid=ecf05e47u5x2w6j499rjd8l61k4bsq07wpq6w4sfpm8vgk7u&rid=giphy.gif&ct=g",
    "https://media1.giphy.com/media/273P92MBOqLiU/giphy.gif?cid=ecf05e47m2xz6g8fm3avd8sny3k91je00kyzengbjwwt48ud&rid=giphy.gif&ct=g",
  ];

  const mlem = mlems[Math.floor(Math.random() * mlems.length)];
  const embed: APIEmbed = {
    title: "A blep",
    image: {
      url: mlem,
    },
  };
  return {
    statusCode: 200,
    body: JSON.stringify({
      type: 4,
      data: {
        tts: false,
        content: "Congrats on sending your command",
        embeds: [embed],
        allowed_mentions: { parse: [] },
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
