import {
  APIApplicationCommandGuildInteraction,
  APIChatInputApplicationCommandGuildInteraction,
} from "discord-api-types/v9";
import { isGuildChatCommandInteraction } from "../../../common/discord/isChatCommandInteraction";
import { HalloweenCommand } from "../../../common/discord/HalloweenCommand";

/**
 * Create a command handler for the provided command.
 * @param command The command this handler operates on, will be validated before invoking handler
 * @param handler The handler function to delegate to once validation is complete
 */
export function chatCommandHandler<T extends HalloweenCommand>(
  command: T,
  handler: (
    interaction: APIChatInputApplicationCommandGuildInteraction,
  ) => void | Promise<void>,
) {
  return async (
    interaction: APIApplicationCommandGuildInteraction,
  ): Promise<void> => {
    if (interaction.data.name.toLowerCase() !== command) {
      // TODO: Error handling
      throw new Error(
        `Command Handler: Expected command "${command}", got "${interaction.data.name}"`,
      );
    }
    if (isGuildChatCommandInteraction(interaction)) {
      return handler(interaction);
    } else {
      // TODO: Error handling
      throw new Error(
        `Command Handler: Expected CHAT command, got something else.`,
      );
    }
  };
}
