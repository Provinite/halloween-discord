import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import nacl = require("tweetnacl");
import { envService } from "../common/envService";
import { handler } from "./interaction-lambda";
import { SignatureHeaders } from "./SignatureHeaders";

describe("lambda:interaction", () => {
  let publicKey: Uint8Array;
  let secretKey: Uint8Array;
  beforeEach(() => {
    const keyPair = nacl.sign.keyPair();
    publicKey = keyPair.publicKey;
    secretKey = keyPair.secretKey;

    jest.spyOn(envService, "getDiscordPublicKey").mockReturnValue(publicKey);
  });

  describe("signature verification", () => {
    it("errors if signature is not provided", async () => {
      const result = await callHandler({
        headers: {
          [SignatureHeaders.Timestamp]: Date(),
        },
        body: JSON.stringify({
          type: 1,
        }),
      });

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body).error.message).toMatchInlineSnapshot(
        `"Invalid request, missing signature elements. Requests to this API must be signed with the \\"X-Signature-Ed25519\\" and \\"X-Signature-Timestamp\\" headers"`,
      );

      expect(result).toMatchSnapshot();
    });
    it("errors if timestamp is not provided", async () => {
      const result = await callHandler({
        headers: {
          [SignatureHeaders.Signature]: "something that doesn't matter",
        },
        body: JSON.stringify({
          type: 1,
        }),
      });

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body).error.message).toMatchInlineSnapshot(
        `"Invalid request, missing signature elements. Requests to this API must be signed with the \\"X-Signature-Ed25519\\" and \\"X-Signature-Timestamp\\" headers"`,
      );

      expect(result).toMatchSnapshot();
    });
    it("errors if the signature is invalid", async () => {
      const timestamp = Date();

      // sign a cool normal body
      const signedBody = JSON.stringify({
        type: 1,
      });

      // send through a #fakehacker body
      const maliciousBody = JSON.stringify({
        action: "Uninstall discord",
        hacker: "lol",
      });

      const event: Partial<APIGatewayProxyEvent> = {
        headers: {
          [SignatureHeaders.Timestamp]: timestamp,
        },
        body: maliciousBody,
      };

      const signature = nacl.sign.detached(
        Buffer.from(timestamp + signedBody),
        secretKey,
      );
      event.headers![SignatureHeaders.Signature] =
        Buffer.from(signature).toString("hex");
      const result = await callHandler(event);

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body).error.message).toMatchInlineSnapshot(
        `"Invalid request, invalid request signature"`,
      );
      expect(result).toMatchSnapshot();
    });
    it("does not error on properly signed requests", async () => {
      const timestamp = Date();
      const body = JSON.stringify({
        type: 1,
      });
      const event: Partial<APIGatewayProxyEvent> = {
        headers: {
          [SignatureHeaders.Timestamp]: timestamp,
        },
        body,
      };

      const signature = nacl.sign.detached(
        Buffer.from(timestamp + body),
        secretKey,
      );
      event.headers![SignatureHeaders.Signature] =
        Buffer.from(signature).toString("hex");
      const result = await callHandler(event);

      expect(result.statusCode).toBe(200);
    });
  });

  it("must ACK a PING", async () => {
    const result = await callHandlerSigned(
      {
        body: JSON.stringify({ type: 1 }),
      },
      secretKey,
    );

    const bodyObj = JSON.parse(result.body);
    expect(bodyObj.type).toBe(1);
    expect(result.statusCode).toBe(200);

    expect(result).toMatchSnapshot();
  });
});

async function callHandlerSigned(
  event: Partial<APIGatewayProxyEvent> = {},
  secretKey: Uint8Array,
) {
  const timestamp = Date();
  event.headers = event.headers || {};
  event.headers[SignatureHeaders.Timestamp] = timestamp;
  const signature = nacl.sign.detached(
    Buffer.from(timestamp + (event.body || "")),
    secretKey,
  );

  event.headers[SignatureHeaders.Signature] =
    Buffer.from(signature).toString("hex");

  return callHandler(event);
}

async function callHandler(
  event: Partial<APIGatewayProxyEvent> = {},
): Promise<APIGatewayProxyResult> {
  const result = await handler(gatewayEvent(event));

  expect(result).toBeTruthy();
  expect(typeof result).toBe("object");
  expect(result).toHaveProperty("statusCode");
  expect(result).toHaveProperty("body");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return result!;
}

export function gatewayEvent(
  evt: Partial<APIGatewayProxyEvent> = {},
): APIGatewayProxyEvent {
  return evt as APIGatewayProxyEvent;
}

export function lambdaContext(ctx: Partial<Context> = {}): Context {
  return ctx as Context;
}
