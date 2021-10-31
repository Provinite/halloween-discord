import {
  APIApplicationCommandGuildInteraction,
  APIChatInputApplicationCommandGuildInteraction,
} from "discord-api-types/v9";
import { isGuildChatCommandInteraction } from "../../../common/discord/isChatCommandInteraction";
import { HalloweenCommand } from "../../../common/discord/HalloweenCommand";
import { HalloweenDiscordError } from "../../errors/HalloweenDiscordError";

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
      throw new HalloweenDiscordError({
        thrownFrom: "chatCommandHandler",
        message: `Something went wrong while handling your interaction. ERR_UNEXPECTED_COMMAND`,
        interaction,
        sourceError: new Error(
          `Received unexpected command in ${command} chat command handler. Command ${interaction.data.name} was routed mistakenly to it.`,
        ),
      });
    }
    if (isGuildChatCommandInteraction(interaction)) {
      return handler(interaction);
    } else {
      throw new HalloweenDiscordError({
        thrownFrom: "chatCommandHandler",
        message: `Something went wrong while handling your interaction. ERR_UNEXPECTED_INTERACTION_KIND`,
        interaction,
        sourceError: new Error(
          `Received unexpected command in ${command} chat command handler. Expected a guild chat command, but got something else.`,
        ),
      });
    }
  };
}
