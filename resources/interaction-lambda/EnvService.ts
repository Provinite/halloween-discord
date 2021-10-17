import { hexToUint8Array } from "./text/TextUtils";

let discordPublicKey: Uint8Array;
let commandLambdaArn: string;

export const envService = {
  getDiscordPublicKey(): Uint8Array {
    if (discordPublicKey) {
      return discordPublicKey;
    }
    const hexKey = process.env.DISCORD_PUBLIC_KEY;
    if (!hexKey) {
      throw new Error("Missing: process.env.DISCORD_PUBLIC_KEY");
    }
    discordPublicKey = hexToUint8Array(hexKey);
    return discordPublicKey;
  },
  getCommandLambdaArn(): string {
    if (commandLambdaArn) {
      return commandLambdaArn;
    }
    const arn = process.env.COMMAND_LAMBDA_ARN;
    if (!arn) {
      throw new Error("Missing: process.env.COMMAND_LAMBDA_ARN");
    }
    commandLambdaArn = arn;
    return commandLambdaArn;
  },
};
