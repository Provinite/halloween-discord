import { RESTPatchAPIInteractionOriginalResponseJSONBody } from "discord-api-types";
import {
  DiscordReportableError,
  DiscordReportableErrorConfig,
} from "../../command-lambda/errors/DiscordReportableError";
import { Color } from "../Color";
import { getDiscordEmbedAuthor } from "../discord/ui/getDiscordEmbedAuthor";
import { getDiscordEmbedTimestamp } from "../discord/ui/getDiscordEmbedTimestamp";

export interface OutOfPrizesErrorConfig
  extends Omit<
    DiscordReportableErrorConfig,
    "message" | "errorsLambda" | "name" | "body"
  > {
  guildId: string;
}

export class OutOfPrizesError extends DiscordReportableError {
  public config: OutOfPrizesErrorConfig & DiscordReportableErrorConfig;
  constructor(config: OutOfPrizesErrorConfig) {
    super("Out of prizes", {
      errorsLambda: false,
      message: "No prizes remaining",
      name: "OutOfPrizesError",
      ...config,
    });
  }

  /**
   * @override
   */
  getDiscordResponseBody(): RESTPatchAPIInteractionOriginalResponseJSONBody {
    return {
      embeds: [
        {
          author: getDiscordEmbedAuthor(),
          timestamp: getDiscordEmbedTimestamp(),
          color: Color.Primary,
          title: "Cloverse Halloween 2021 - All Out of Prizes",
          description: "We're all out of prizes this year. Thanks for joining!",
        },
      ],
    };
  }
}
