import {
  APIInteraction,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from "discord-api-types/v9";
import { getInteractionContextOrDie } from "../../common/discord/interactionContext";

export class DiscordReportableError extends Error {
  constructor(message: string, public config: DiscordReportableErrorConfig) {
    super(message);
  }
  getDiscordResponseBody(): RESTPatchAPIInteractionOriginalResponseJSONBody {
    if (!this.config.body) {
      return {
        content:
          "Something went wrong. Also, something went wrong while trying to tell you what went wrong. This is awkward. Ref:" +
          this.getInteraction().id,
      };
    }
    return this.config.body;
  }
  getInteraction(): APIInteraction {
    return this.config.interaction || getInteractionContextOrDie();
  }
}

export interface DiscordReportableErrorConfig {
  body?: RESTPatchAPIInteractionOriginalResponseJSONBody;
  message: string;
  name: string;
  thrownFrom: string;
  /** true if the lambda should error after handling this error */
  errorsLambda: boolean;
  sourceError: Error;
  interaction?: APIInteraction;
}
