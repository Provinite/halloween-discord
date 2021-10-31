import { RESTPatchAPIInteractionOriginalResponseJSONBody } from "discord-api-types/v9";
import {
  DiscordReportableError,
  DiscordReportableErrorConfig,
} from "../../command-lambda/errors/DiscordReportableError";
import { Color } from "../Color";
import { getDiscordEmbedTimestamp } from "../discord/ui/getDiscordEmbedTimestamp";
import { getErrorDiscordEmbedFooter } from "./util/getErrorDiscordEmbedFooter";
export interface EventNotStartedErrorConfig
  extends DiscordReportableErrorConfig {
  startDate?: Date | null;
  endDate?: Date | null;
}
export class EventNotStartedError extends DiscordReportableError {
  public config: EventNotStartedErrorConfig;
  constructor(
    config: Omit<
      EventNotStartedErrorConfig,
      "name" | "body" | "errorsLambda" | "message"
    >,
  ) {
    super("Event not yet started", {
      ...config,
      message: "Event not yet started",
      name: "EventNotStartedError",
      errorsLambda: false,
    });
  }

  getDiscordResponseBody(): RESTPatchAPIInteractionOriginalResponseJSONBody {
    return {
      embeds: [
        {
          title: "Cloverse Halloween 2021 - Event not started",
          description: "The event hasn't started yet, but check back soon!",
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
