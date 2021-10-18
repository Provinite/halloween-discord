import {
  APIChatInputApplicationCommandGuildInteraction,
  ApplicationCommandInteractionDataOptionSubCommand,
} from "discord-api-types/v9";

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
  return (subCommand, interaction) => {
    if (subCommand.name !== subCommandName) {
      // TODO: Error handling
      throw new Error(
        `SubCommand Handler: Expected subcommand "${subCommandName}" got "${subCommand.name}"`,
      );
    }
    if (requiredPermissions !== null) {
      const perms = BigInt(interaction.member.permissions);
      const canUseCommand = perms & requiredPermissions;
      if (!canUseCommand) {
        // TODO: Error handling
        throw new Error("You lack the requisite permissions for this command.");
      }
    }
    return handlerFn(subCommand, interaction);
  };
}
