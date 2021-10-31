import {
  APIInteraction,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from "discord-api-types/v9";
import { envService } from "../envService";
import { getClientCredentialsToken } from "./getClientCredentialsToken";
import { getInteractionResponse } from "./getInteractionResponse";
import { updateInteractionResponse } from "./updateInteractionResponse";

export const discordService = {
  getInteractionResponse: async (
    interaction: APIInteraction,
  ): ReturnType<typeof getInteractionResponse> => {
    return getInteractionResponse(envService.getDiscordBotToken(), interaction);
  },
  getClientCredentialsToken,
  updateInteractionResponse: async (
    interaction: APIInteraction,
    body: RESTPatchAPIInteractionOriginalResponseJSONBody,
  ): ReturnType<typeof updateInteractionResponse> => {
    return updateInteractionResponse(
      envService.getDiscordBotToken(),
      interaction.token,
      body,
    );
  },
};
