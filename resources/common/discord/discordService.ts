import {
  APIInteraction,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from "discord-api-types";
import { getClientCredentialsToken } from "./getClientCredentialsToken";
import { getInteractionResponse } from "./getInteractionResponse";
import { updateInteractionResponse } from "./updateInteractionResponse";

export const discordService = {
  getInteractionResponse: async (
    interaction: APIInteraction,
  ): ReturnType<typeof getInteractionResponse> => {
    return getInteractionResponse(
      await getClientCredentialsToken(),
      interaction,
    );
  },
  getClientCredentialsToken,
  updateInteractionResponse: async (
    interaction: APIInteraction,
    body: RESTPatchAPIInteractionOriginalResponseJSONBody,
  ): ReturnType<typeof updateInteractionResponse> => {
    return updateInteractionResponse(
      await getClientCredentialsToken(),
      interaction.token,
      body,
    );
  },
};
