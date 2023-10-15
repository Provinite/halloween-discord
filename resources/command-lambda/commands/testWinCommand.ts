import { PermissionFlagsBits } from "discord-api-types/v9";
import { guildSettingsService } from "../../common/db/guildSettingsService";
import { discordService } from "../../common/discord/discordService";
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { hasPermissionFlag } from "../../common/discord/hasPermissionFlag";
import { HalloweenDiscordError } from "../errors/HalloweenDiscordError";
import { chatCommandHandler } from "./handlers/chatCommandHandler";

export const testWinCommand = chatCommandHandler(
  HalloweenCommand.TestWin,
  async (interaction) => {
    if (
      !hasPermissionFlag(
        interaction.member.permissions,
        PermissionFlagsBits.Administrator,
      )
    ) {
      throw new HalloweenDiscordError({
        thrownFrom: "testWinCommand",
        message: "You are missing the required permissions to use this command",
        sourceError: new Error("Missing admin perms for testWin command"),
      });
    }
    const guildSettings = await guildSettingsService.getGuildSettings(
      interaction.guild_id,
    );
    if (guildSettings.winChannel) {
      await discordService.sendChannelMessage(guildSettings.winChannel, {
        content: "Test message",
      });
      await discordService.updateInteractionResponse(interaction, {
        content: "Sent test message.",
      });
    } else {
      await discordService.updateInteractionResponse(interaction, {
        content: "Win channel isn't set.",
      });
    }
  },
);
