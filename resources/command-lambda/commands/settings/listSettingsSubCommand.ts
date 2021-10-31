import { PermissionFlagsBits } from "discord-api-types/v9";
import moment = require("moment");
import { Color } from "../../../common/Color";
import { guildSettingsService } from "../../../common/db/guildSettingsService";
import { discordService } from "../../../common/discord/discordService";
import {
  commandStructure,
  HalloweenCommand,
} from "../../../common/discord/HalloweenCommand";
import { getDiscordEmbedAuthor } from "../../../common/discord/ui/getDiscordEmbedAuthor";
import { getDiscordEmbedTimestamp } from "../../../common/discord/ui/getDiscordEmbedTimestamp";
import { chatSubcommandHandler } from "../handlers/chatSubcommandHandler";

export const listSettingsSubCommand = chatSubcommandHandler(
  {
    subCommandName: commandStructure[HalloweenCommand.Settings].List,
    requiredPermissions: PermissionFlagsBits.Administrator,
  },
  async (subCommand, interaction) => {
    const settings = await guildSettingsService.getGuildSettings(
      interaction.guild_id,
    );

    await discordService.updateInteractionResponse(interaction, {
      embeds: [
        {
          title: "[Admin] Event Settings",
          author: getDiscordEmbedAuthor(),
          color: Color.Primary,
          timestamp: getDiscordEmbedTimestamp(),
          fields: [
            {
              name: "Reset Time (0=midnight-23=11pm) (US Central Daylight Time)",
              value: settings.resetTime.toString(),
            },
            {
              name: "Knocks Per Day",
              value: settings.knocksPerDay.toString(),
            },
            {
              name: "Win Rate",
              value: settings.winRate.toString(),
            },
            {
              name: "Start Date",
              value: settings.startDate
                ? moment(settings.startDate)
                    .tz("America/Chicago")
                    .format("YYYY-MM-DD h:mm a")
                    .toUpperCase()
                : "None",
            },
            {
              name: "End Date",
              value: settings.endDate
                ? moment(settings.endDate)
                    .tz("America/Chicago")
                    .format("YYYY-MM-DD h:mm a")
                    .toUpperCase()
                : "None",
            },
            {
              name: "Win Channel",
              value: settings.winChannel ? `<#${settings.winChannel}>` : "None",
            },
          ],
        },
      ],
    });
  },
);
