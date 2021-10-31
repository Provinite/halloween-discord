import {
  APIApplicationCommandGuildInteraction,
  APIUserApplicationCommandGuildInteraction,
  ApplicationCommandType,
} from "discord-api-types/v9";

export function isUserGuildCommandInteraction(
  interaction: APIApplicationCommandGuildInteraction,
): interaction is APIUserApplicationCommandGuildInteraction {
  if (
    interaction.guild_id &&
    interaction.data.type === ApplicationCommandType.User
  ) {
    return true;
  }
  return false;
}
