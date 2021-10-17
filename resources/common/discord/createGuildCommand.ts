import axios, { AxiosResponse } from "axios";
import {
  APIApplicationCommand,
  RESTPostAPIApplicationGuildCommandsJSONBody,
} from "discord-api-types";
import { envService } from "../envService";

export async function createGuildCommand(
  token: string,
  body: RESTPostAPIApplicationGuildCommandsJSONBody,
): Promise<APIApplicationCommand> {
  const data = await axios.post<
    RESTPostAPIApplicationGuildCommandsJSONBody,
    AxiosResponse<APIApplicationCommand>
  >(
    `https://discord.com/api/v8/applications/${envService.getDiscordApplicationId()}/commands`,
    body,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data.data;
}
