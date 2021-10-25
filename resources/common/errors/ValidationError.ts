import {
  APIInteraction,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from "discord-api-types";
import {
  DiscordReportableError,
  DiscordReportableErrorConfig,
} from "../../command-lambda/errors/DiscordReportableError";

export interface ValidationFieldError {
  field: string;
  error: string;
}

export interface ValidationErrorConfig {
  message: string;
  thrownFrom: string;
  validationErrors: ValidationFieldError[];
  sourceError: Error;
  /**
   * Interaction for reporting the error. If not set,
   * the interactionContext asyncLocalStorage will be used.
   */
  interaction?: APIInteraction;
}
export class ValidationError extends DiscordReportableError {
  public config: DiscordReportableErrorConfig & ValidationErrorConfig;
  constructor(validationConfig: ValidationErrorConfig) {
    super(`Validation failed`, {
      ...validationConfig,
      name: "ValidationError",
      errorsLambda: true,
    });
  }

  /**
   * @override
   */
  getDiscordResponseBody(): RESTPatchAPIInteractionOriginalResponseJSONBody {
    return {
      content: this.config.message,
      embeds: [
        {
          title: "Cloverse Halloween 2021 - Validation failed",
          description: this.config.message,
          fields: this.config.validationErrors.map((error) => ({
            name: error.field,
            value: error.error,
          })),
        },
      ],
    };
  }
}
