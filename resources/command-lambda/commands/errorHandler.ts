import { APIInteraction } from "discord-api-types/v9";
import { getClientCredentialsToken } from "../../common/discord/getClientCredentialsToken";
import { getInteractionContextOrDie } from "../../common/discord/interactionContext";
import { updateInteractionResponse } from "../../common/discord/updateInteractionResponse";
import { DiscordReportableError } from "../errors/DiscordReportableError";
import { commandLambdaLogger } from "../util/commandLambdaLogger";

export const errorHandler = async (
  error: Error,
  interaction: APIInteraction = getInteractionContextOrDie(),
): Promise<void> => {
  commandLambdaLogger.error({
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
