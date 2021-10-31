import { APIEmbedFooter } from "discord-api-types/v9";
import { getInteractionContextOrDie } from "../../discord/interactionContext";

export const getErrorDiscordEmbedFooter = (
  interaction = getInteractionContextOrDie(),
): APIEmbedFooter => {
  return {
    text: `Reference ID: ${interaction.id}`,
  };
};
