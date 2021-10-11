import { hexToUint8Array } from "./text/TextUtils";

export const envService = {
  getDiscordPublicKey(): Uint8Array {
    const hexKey = process.env.DISCORD_PUBLIC_KEY;
    if (!hexKey) {
      throw new Error("Missing: process.env.DISCORD_PUBLIC_KEY");
    }
    return hexToUint8Array(hexKey);
  },
};
