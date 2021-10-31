import axios, { AxiosResponse } from "axios";
import {
  APIInteraction,
  APIMessage,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
  RESTPostAPIChannelMessageJSONBody,
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
  sendChannelMessage: async (
    channelId: string,
    body: RESTPostAPIChannelMessageJSONBody,
  ): Promise<APIMessage> => {
    const token = envService.getDiscordBotToken();
    const url = `https://discord.com/api/channels/${channelId}/messages`;
    const headers = {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post<
      RESTPostAPIChannelMessageJSONBody,
      AxiosResponse<APIMessage>
    >(url, body, {
      headers,
    });
    return response.data;
  },
};
