import {
  APIInteraction,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from "discord-api-types/v9";
import { Color } from "../../common/Color";
import { getDiscordEmbedAuthor } from "../../common/discord/ui/getDiscordEmbedAuthor";
import { getDiscordEmbedTimestamp } from "../../common/discord/ui/getDiscordEmbedTimestamp";
import { getErrorDiscordEmbedFooter } from "../../common/errors/util/getErrorDiscordEmbedFooter";
import { DiscordReportableError } from "./DiscordReportableError";

export class HalloweenDiscordError extends DiscordReportableError {
  constructor({
    thrownFrom,
    message,
    interaction,
    sourceError,
    errorsLambda,
  }: {
    errorsLambda?: boolean;
    thrownFrom: string;
    message: string;
    interaction?: APIInteraction;
    sourceError: Error;
  }) {
    super(message, {
      sourceError,
      errorsLambda: errorsLambda === undefined ? true : errorsLambda,
      interaction,
      message,
      name: "HalloweenDiscordError",
      thrownFrom,
    });
  }

  getDiscordResponseBody(): RESTPatchAPIInteractionOriginalResponseJSONBody {
    const interaction = this.getInteraction();
    const message = this.config.message;
    return {
      embeds: [
        {
          author: getDiscordEmbedAuthor(),
          timestamp: getDiscordEmbedTimestamp(),
          color: Color.Error,
          footer: getErrorDiscordEmbedFooter(interaction),
          title: "Cloverse Halloween 2021 - Error",
          description: "Something went wrong",
          fields: [
            {
              name: "Message",
              value: message,
            },
          ],
        },
      ],
    };
  }
}
