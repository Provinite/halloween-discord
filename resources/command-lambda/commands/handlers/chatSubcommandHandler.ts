import {
  APIChatInputApplicationCommandGuildInteraction,
  ApplicationCommandInteractionDataOptionSubCommand,
} from "discord-api-types/v9";
import { HalloweenDiscordError } from "../../errors/HalloweenDiscordError";

export type ChatSubcommandHandler = (
  subCommand: ApplicationCommandInteractionDataOptionSubCommand,
  interaction: APIChatInputApplicationCommandGuildInteraction,
) => void | Promise<void>;

/**
 * Create a subcommand handler.
 * @param subCommandName - The name of the subcommand that this handler is for
 * @param requiredPermission - If set, the permission flag bits to check before processing
 *  the command. See PermissionFlagsBits in "discord-api-types/v9"
 * @param handlerFn - The actual command handler function.
 * @returns
 */
export function chatSubcommandHandler(
  {
    subCommandName,
    requiredPermissions = null,
  }: { subCommandName: string; requiredPermissions: bigint | null },
  handlerFn: ChatSubcommandHandler,
): ChatSubcommandHandler {
  return async (subCommand, interaction) => {
    if (subCommand.name !== subCommandName) {
      throw new HalloweenDiscordError({
        thrownFrom: `chatSubcommandHandler`,
        message: `Something went wrong while handling your interaction. ERR_UNEXPECTED_SUBCOMMAND`,
        interaction,
        sourceError: new Error(
          `Received unexpected command in ${subCommandName} chat subcommand handler. Command ${interaction.data.name} -> ${subCommand.name} was routed mistakenly to it.`,
        ),
      });
    }
    if (requiredPermissions !== null) {
      const perms = BigInt(interaction.member.permissions);
      const canUseCommand = perms & requiredPermissions;
      if (!canUseCommand) {
        throw new HalloweenDiscordError({
          thrownFrom: "chatSubcommandHandler",
          message: "You lack the required permissions for that command.",
          interaction,
          sourceError: new Error(
            `Invalid permissions when attempting to process command ${subCommandName}`,
          ),
        });
      }
    }
    return handlerFn(subCommand, interaction);
  };
}
