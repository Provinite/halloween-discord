import { base64ToUint8Array } from "./TextUtils";

export const envService = {
  getDiscordPublicKey(): Uint8Array {
    const base64Key = process.env.DISCORD_PUBLIC_KEY;
    if (!base64Key) {
      throw new Error("Missing: process.env.DISCORD_PUBLIC_KEY");
    }
    return base64ToUint8Array(base64Key);
  },
};
