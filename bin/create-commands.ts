import { isAxiosError } from "../resources/common/axios/isAxiosError";
import { bulkWriteGuildCommands } from "../resources/common/discord/bulkWriteGuildCommands";
import { commandDefinitions } from "../resources/common/discord/commandDefinitions";
import { getClientCredentialsToken } from "../resources/common/discord/getClientCredentialsToken";
import { logger } from "../resources/common/log";

if (!process.env.TEST_GUILD_ID) {
  throw new Error("Must set cchdiscord_test_guild_id");
}

const testGuildId = process.env.TEST_GUILD_ID;

(async function () {
  const token = await getClientCredentialsToken();
  try {
    await bulkWriteGuildCommands(
      token,
      testGuildId,
      Object.values(commandDefinitions),
    );
  } catch (err) {
    if (isAxiosError(err)) {
      logger.error({
        message: `Failed communicating with the discord API (${err.name}): ${err.message}`,
        url: err.config.url,
        responseData: JSON.stringify(err.response?.data || "{}", null, 2),
        requestBody: err.config.data,
      });
      logger.error((err.response?.data as any).errors);
      throw err;
    }
  }
})();
