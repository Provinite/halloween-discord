import axios, { AxiosResponse } from "axios";
import {
  APIApplicationCommand,
  RESTPostAPIApplicationGuildCommandsJSONBody,
} from "discord-api-types/v9";
import { envService } from "../envService";

/**
 * Bulk overwrite discord application commands for a guild.
 * @param token Discord client credentials token.
 * @param guildId Discord guild id.
 * @param bodies Array of command bodies.
 * @returns Promise that resolves to the response.
 */
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
