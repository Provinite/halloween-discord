import {
  APIApplicationCommandGuildInteraction,
  APIChatInputApplicationCommandGuildInteraction,
  APIUserApplicationCommandGuildInteraction,
} from "discord-api-types/v9";
import { HalloweenCommand } from "../../../common/discord/HalloweenCommand";
import { isGuildChatCommandInteraction } from "../../../common/discord/isChatCommandInteraction";
import { isUserGuildCommandInteraction } from "../../../common/discord/isUserGuildCommandInteraction";
import { HalloweenDiscordError } from "../../errors/HalloweenDiscordError";

/**
 * Create a command handler for the provided user command. Only works in guilds.
 * @param command The command this handler operates on, will be validated before invoking handler
 * @param handler The handler function to delegate to once validation is complete
 */
export function chatOrUserCommandHandler<T extends HalloweenCommand>(
  command: T,
  handler: (
    interaction:
      | APIUserApplicationCommandGuildInteraction
      | APIChatInputApplicationCommandGuildInteraction,
  ) => void | Promise<void>,
) {
  return async (
    interaction: APIApplicationCommandGuildInteraction,
  ): Promise<void> => {
    if (interaction.data.name.toLowerCase() !== command) {
      throw new HalloweenDiscordError({
        thrownFrom: "chatOrUserCommandHandler",
        message: `Something went wrong while handling your interaction. ERR_UNEXPECTED_COMMAND`,
        interaction,
        sourceError: new Error(
          `Received unexpected command in ${command} mixed Chat/User command handler. Command ${interaction.data.name} was routed mistakenly to it.`,
        ),
      });
    }
    if (
      isUserGuildCommandInteraction(interaction) ||
      isGuildChatCommandInteraction(interaction)
    ) {
      return handler(interaction);
    } else {
      throw new HalloweenDiscordError({
        thrownFrom: "userCommandHandler",
        message: `Something went wrong while handling your interaction. ERR_UNEXPECTED_INTERACTION_KIND`,
        interaction,
        sourceError: new Error(
          `Received unexpected command in ${command} user command handler. Expected a guild user or chat command, but got something else.`,
        ),
      });
    }
  };
}
