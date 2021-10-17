import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types";
import { isAxiosError } from "../resources/common/axios/isAxiosError";
import { createGuildCommand } from "../resources/common/discord/createGuildCommand";
import { getClientCredentialsToken } from "../resources/common/discord/getClientCredentialsToken";
import { logger } from "../resources/common/log";

if (!process.env.cchdiscord_test_guild_id) {
  throw new Error("Must set cchdiscord_test_guild_id");
}

(async function () {
  const token = await getClientCredentialsToken();
  try {
    await createGuildCommand(token, {
      guild_id: process.env.cchdiscord_test_guild_id || undefined,
      name: "knock",
      description: "Trick or Treat!",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          description: "Knockity",
          type: ApplicationCommandOptionType.SubcommandGroup,
          name: "knock",
          options: [
            {
              name: "knock",
              type: ApplicationCommandOptionType.Subcommand,
              description: "Knock",
            },
            {
              name: "knockknock",
              type: ApplicationCommandOptionType.Subcommand,
              description: "knock knock knock",
            },
            {
              name: "knockknockknockknock",
              type: ApplicationCommandOptionType.Subcommand,
              description: "knock knock knockknockknockknockknock",
            },
            {
              name: "justabsolutelytearthatdoordown",
              type: ApplicationCommandOptionType.Subcommand,
              description: "I'm comin in",
            },
          ],
        },
      ],
    });
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
