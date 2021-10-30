import { APIInteraction } from "discord-api-types/v9";
import { discordService } from "../../common/discord/discordService";
import { getInteractionContextOrDie } from "../../common/discord/interactionContext";
import { DiscordWebhookMessageUnavailableError } from "../../common/errors/DiscordWebhookMessageUnavailable";
import { DiscordReportableError } from "../errors/DiscordReportableError";
import { commandLambdaLogger } from "../util/commandLambdaLogger";

export const errorHandler = async (
  error: Error,
  interaction: APIInteraction = getInteractionContextOrDie(),
): Promise<void> => {
  commandLambdaLogger.error({
    message: "Error processing command: " + error.message,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    interaction,
    sourceError: "sourceError" in error ? (error as any).sourceError : null,
  });
  if (error instanceof DiscordReportableError) {
    await discordService.updateInteractionResponse(
      interaction,
      error.getDiscordResponseBody(),
    );
    if (error.config.errorsLambda) {
      throw error;
    }
  } else if (error instanceof DiscordWebhookMessageUnavailableError) {
    commandLambdaLogger.error({
      message:
        "Discord webhook message unavailable. Interaction lambda probably took too long.",
      interaction,
      name: "DiscordWebhookMessageUnavailableError",
    });
  } else {
    const unknownError = new DiscordReportableError(
      `An unknown error ocurred while processing your request`,
      {
        errorsLambda: true,
        message: "An unknown error ocurred while processing your request",
        sourceError: error,
        name: "UnknownError",
        thrownFrom: "errorHandler",
        interaction,
      },
    );
    await discordService.updateInteractionResponse(
      interaction,
      unknownError.getDiscordResponseBody(),
    );
  }
};
