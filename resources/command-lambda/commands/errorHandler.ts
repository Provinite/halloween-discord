import {
  APIInteraction,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from "discord-api-types/v9";
import { getClientCredentialsToken } from "../../common/discord/getClientCredentialsToken";
import { updateInteractionResponse } from "../../common/discord/updateInteractionResponse";
import { logger } from "../../common/log";
import { DiscordReportableError } from "../errors/DiscordReportableError";

export const reportError = async (
  error: Error,
  interaction: APIInteraction,
): Promise<void> => {
  logger.error({
    message: "Error processing command",
    error,
    interaction,
  });
  if (error instanceof DiscordReportableError) {
    await updateInteractionResponse(
      await getClientCredentialsToken(),
      interaction.token,
      error.getDiscordResponseBody(),
    );
  } else {
    await updateInteractionResponse(
      await getClientCredentialsToken(),
      interaction.token,
      {
        content:
          "An unknown error ocurred while processing your request. Reference ID: " +
          interaction.id,
      },
    );
  }
};
