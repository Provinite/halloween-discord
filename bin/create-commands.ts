import { OAuth2Scopes } from "discord-api-types/v9";
import { isAxiosError } from "../resources/common/axios/isAxiosError";
import { bulkWriteGuildCommands } from "../resources/common/discord/bulkWriteGuildCommands";
import { commandDefinitions } from "../resources/common/discord/commandDefinitions";
import { getClientCredentialsToken } from "../resources/common/discord/getClientCredentialsToken";
import { logger } from "../resources/common/Logger";
if (!process.env.TEST_GUILD_ID) {
  throw new Error("Must set cchdiscord_test_guild_id");
}

const testGuildId = process.env.TEST_GUILD_ID;

void (async function () {
  const token = await getClientCredentialsToken([
    OAuth2Scopes.ApplicationsCommandsUpdate,
  ]);
  try {
    await bulkWriteGuildCommands(
      token,
      testGuildId,
      flattenArray(Object.values(commandDefinitions)),
    );
  } catch (err: any) {
    if (isAxiosError(err)) {
      logger.error({
        message: `Failed communicating with the discord API (${err.name}): ${err.message}`,
        url: err.config.url,
        responseData: JSON.stringify(err.response?.data || "{}", null, 2),
        requestBody: err.config.data,
      });
      logger.error((err.response?.data as any).errors);
      throw err;
    } else {
      logger.error({
        error: err,
        stack: err?.stack,
      });
      throw err;
    }
  }
})();

function flattenArray<T>(arr: (T | T[])[]): T[] {
  const result = [];
  for (const el of arr) {
    if (Array.isArray(el)) {
      result.push(...el);
    } else {
      result.push(el);
    }
  }
  return result;
}
