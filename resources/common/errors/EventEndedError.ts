import { RESTPatchAPIInteractionOriginalResponseJSONBody } from "discord-api-types/v9";
import {
  DiscordReportableError,
  DiscordReportableErrorConfig,
} from "../../command-lambda/errors/DiscordReportableError";
import { Color } from "../Color";
import { getDiscordEmbedTimestamp } from "../discord/ui/getDiscordEmbedTimestamp";
import { getErrorDiscordEmbedFooter } from "./util/getErrorDiscordEmbedFooter";
export interface EventEndedErrorConfig extends DiscordReportableErrorConfig {
  startDate?: Date | null;
  endDate?: Date | null;
}
export class EventEndedError extends DiscordReportableError {
  public config: EventEndedErrorConfig;
  constructor(
    config: Omit<
      EventEndedErrorConfig,
      "name" | "body" | "errorsLambda" | "message"
    >,
  ) {
    super("Event already ended", {
      ...config,
      message: "Event already ended",
      name: "EventEndedError",
      errorsLambda: false,
    });
  }

  getDiscordResponseBody(): RESTPatchAPIInteractionOriginalResponseJSONBody {
    return {
      embeds: [
        {
          title: "Cloverse Halloween 2023 - Event over",
          description:
            "The event is over. Thanks for participating and we'll be back soon with more fun!",
          color: Color.Error,
          timestamp: getDiscordEmbedTimestamp(),
          footer: getErrorDiscordEmbedFooter(this.getInteraction()),
          fields: [
            {
              name: "Start date",
              value: this.config.startDate?.toLocaleString() || "N/A",
            },
            {
              name: "End date",
              value: this.config.endDate?.toLocaleString() || "N/A",
            },
          ],
        },
      ],
    };
  }
}
