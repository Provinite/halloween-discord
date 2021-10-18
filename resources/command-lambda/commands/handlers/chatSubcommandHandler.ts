import {
  APIChatInputApplicationCommandGuildInteraction,
  ApplicationCommandInteractionDataOptionSubCommand,
} from "discord-api-types/v9";
import { getClientCredentialsToken } from "../../../common/discord/getClientCredentialsToken";
import { updateInteractionResponse } from "../../../common/discord/updateInteractionResponse";

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
        await updateInteractionResponse(
          await getClientCredentialsToken(),
          interaction.token,
          { content: "You lack the required permissions to use this command" },
        );
        return;
      }
    }
    return handlerFn(subCommand, interaction);
  };
}
