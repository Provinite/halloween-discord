import { RESTPatchAPIInteractionOriginalResponseJSONBody } from "discord-api-types/v9";
import {
  DiscordReportableError,
  DiscordReportableErrorConfig,
} from "../../command-lambda/errors/DiscordReportableError";
import { Color } from "../Color";
import { getErrorDiscordEmbedFooter } from "./util/getErrorDiscordEmbedFooter";
import { SetOptional } from "type-fest";
import { Moment } from "moment";
import moment = require("moment-timezone");
import { getDiscordEmbedTimestamp } from "../discord/ui/getDiscordEmbedTimestamp";
export interface TooManyKnocksErrorConfig extends DiscordReportableErrorConfig {
  knocksPerDay: number;
  resetTime: number;
  lastResetTime: Moment;
  guildId: string;
  userId: string;
}
export class TooManyKnocksError extends DiscordReportableError {
  public config: TooManyKnocksErrorConfig;
  constructor(
    config: SetOptional<
      Omit<TooManyKnocksErrorConfig, "name" | "errorsLambda" | "body">,
      "message"
    >,
  ) {
    const message =
      config.message ||
      `Too many knocks for user ${config.userId} in guild ${config.guildId}`;

    super(message, {
      ...config,
      name: "TooManyKnocksError",
      errorsLambda: false,
      message,
    });
  }

  /**
   * @override
   */
  getDiscordResponseBody(): RESTPatchAPIInteractionOriginalResponseJSONBody {
    return {
      embeds: [
        {
          title: "Cloverse Halloween 2021 - Too Many Knocks",
          description: `You're out of knocks for now. Come back soon, knocks reset every day.`,
          color: Color.Error,
          timestamp: getDiscordEmbedTimestamp(),
          footer: getErrorDiscordEmbedFooter(this.getInteraction()),
          fields: [
            {
              name: "Knocks Per Day",
              value: this.config.knocksPerDay.toString(),
            },
            {
              name: "Reset Time (24h format)",
              value:
                moment
                  .tz("America/Chicago")
                  .hour(this.config.resetTime)
                  .format("h a")
                  .toUpperCase() + " US Central Time",
            },
            {
              name: "Last Reset Time",
              value: `${this.config.lastResetTime
                .tz("America/Chicago")
                .format("YYYY-MM-DD h:mm:ss a")}`,
            },
          ],
        },
      ],
    };
  }
}
