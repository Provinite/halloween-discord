import { RESTPatchAPIInteractionOriginalResponseJSONBody } from "discord-api-types/v9";
import {
  DiscordReportableError,
  DiscordReportableErrorConfig,
} from "../../command-lambda/errors/DiscordReportableError";
import { Color } from "../Color";
import { getErrorDiscordEmbedFooter } from "./util/getErrorDiscordEmbedFooter";
import { SetOptional } from "type-fest";
import { getDiscordEmbedTimestamp } from "../discord/ui/getDiscordEmbedTimestamp";
export interface MissingGuildSettingsErrorConfig
  extends DiscordReportableErrorConfig {
  guildId: string;
}
export class MissingGuildSettingsError extends DiscordReportableError {
  public config: MissingGuildSettingsErrorConfig;
  constructor(
    config: SetOptional<
      Omit<MissingGuildSettingsErrorConfig, "name" | "errorsLambda" | "body">,
      "message"
    >,
  ) {
    const message =
      config.message ||
      `No guild settings found for guild ID ${config.guildId}`;

    super(message, {
      ...config,
      name: "MissingGuildSettingsError",
      errorsLambda: true,
      message,
    });
  }

  getDiscordResponseBody(): RESTPatchAPIInteractionOriginalResponseJSONBody {
    return {
      embeds: [
        {
          title: "Cloverse Halloween 2023 - Not Ready Yet",
          description:
            "The admins haven't set up the app for this server yet. Check back soon!",
          color: Color.Error,
          timestamp: getDiscordEmbedTimestamp(),
          footer: getErrorDiscordEmbedFooter(this.getInteraction()),
        },
      ],
    };
  }
}
