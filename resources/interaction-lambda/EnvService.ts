import { hexToUint8Array } from "./text/TextUtils";

export const envService = {
  getDiscordPublicKey(): Uint8Array {
    const hexKey = process.env.DISCORD_PUBLIC_KEY;
    if (!hexKey) {
      throw new Error("Missing: process.env.DISCORD_PUBLIC_KEY");
    }
    return hexToUint8Array(hexKey);
  },
  getFulfillmentQueueUrl(): string {
    if (!process.env.FULFILLMENT_QUEUE_URL) {
      throw new Error("Missing: process.env.FULFILLMENT_QUEUE_URL");
    }
    return process.env.FULFILLMENT_QUEUE_URL;
  },
};
