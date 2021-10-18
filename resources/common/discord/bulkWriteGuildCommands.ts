import axios, { AxiosResponse } from "axios";
import {
  APIApplicationCommand,
  RESTPostAPIApplicationGuildCommandsJSONBody,
} from "discord-api-types/v9";
import { envService } from "../envService";

export async function bulkWriteGuildCommands(
  token: string,
  guildId: string,
  bodies: RESTPostAPIApplicationGuildCommandsJSONBody[],
): Promise<APIApplicationCommand> {
  const data = await axios.put<
    RESTPostAPIApplicationGuildCommandsJSONBody[],
    AxiosResponse<APIApplicationCommand>
  >(
    `https://discord.com/api/v8/applications/${envService.getDiscordApplicationId()}/guilds/${guildId}/commands`,
    bodies,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data.data;
}
