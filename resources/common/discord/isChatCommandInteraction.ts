import {
  APIApplicationCommandGuildInteraction,
  APIChatInputApplicationCommandGuildInteraction,
  ApplicationCommandType,
} from "discord-api-types/v9";

export function isGuildChatCommandInteraction(
  interaction: APIApplicationCommandGuildInteraction,
): interaction is APIChatInputApplicationCommandGuildInteraction {
  if (
    interaction.guild_id &&
    interaction.data.type === ApplicationCommandType.ChatInput
  ) {
    return true;
  }
  return false;
}
