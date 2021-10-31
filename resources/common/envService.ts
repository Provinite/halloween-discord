import { hexToUint8Array } from "../interaction-lambda/text/TextUtils";

const cache: Record<string, any> = {};

export const envService = {
  getDiscordPublicKey: requiredEnvGetter("DISCORD_PUBLIC_KEY", hexToUint8Array),
  getCommandLambdaArn: requiredEnvGetter("COMMAND_LAMBDA_ARN"),
  getDiscordClientSecret: requiredEnvGetter("DISCORD_CLIENT_SECRET"),
  getDiscordApplicationId: requiredEnvGetter("DISCORD_APPLICATION_ID"),
  getFulfillmentQueueUrl: requiredEnvGetter("FULFILLMENT_QUEUE_URL"),
  getDiscordBotToken: requiredEnvGetter("DISCORD_BOT_TOKEN"),
  getImageBucketUrl: requiredEnvGetter("IMAGE_BUCKET_URL", (s) => {
    if (!s.endsWith("/")) {
      s = s + "/";
    }
    return s;
  }),
};

function requiredEnvGetter(envKey: string): () => string;
function requiredEnvGetter<T = string>(
  envKey: string,
  transform: (s: string) => T,
): () => T;
function requiredEnvGetter<T = string>(
  envKey: string,
  transform?: (s: string) => T,
): () => T {
  return function () {
    const existingResult = cache[envKey];
    if (existingResult) {
      return existingResult;
    }
    let envVar: any = process.env[envKey];
    if (!envVar) {
      throw new Error(`Missing: process.env.${envKey}`);
    }
    if (transform) {
      envVar = transform(envVar);
    }
    cache[envKey] = envVar;
    return envVar;
  };
}
