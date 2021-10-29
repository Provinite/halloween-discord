import { PermissionFlagsBits } from "discord-api-types/v9";
import { knex } from "../../../common/db/client";
import { HalloweenTable } from "../../../common/db/TableName";
import { discordService } from "../../../common/discord/discordService";
import {
  commandStructure,
  HalloweenCommand,
} from "../../../common/discord/HalloweenCommand";
import { getDiscordEmbedTimestamp } from "../../../common/discord/ui/getDiscordEmbedTimestamp";
import { chatSubcommandHandler } from "../handlers/chatSubcommandHandler";

export const listSettingsSubCommand = chatSubcommandHandler(
  {
    subCommandName: commandStructure[HalloweenCommand.Settings].List,
    requiredPermissions: PermissionFlagsBits.Administrator,
  },
  async (subCommand, interaction) => {
    const settings = await knex(HalloweenTable.GuildSettings)
      .select("*")
      .where({
        guildId: interaction.guild_id,
      })
      .first();
    if (!settings) {
      await discordService.updateInteractionResponse(interaction, {
        content:
          "Looks like settings haven't been configured for this server yet",
      });
      return;
    }

    await discordService.updateInteractionResponse(interaction, {
      embeds: [
        {
          title: "[Admin] Event Settings",
          timestamp: getDiscordEmbedTimestamp(),
          fields: [
            {
              name: "Reset Time (0=midnight-23=11pm) (US Central Daylight Time)",
              value: settings.resetTime.toString(),
            },
            {
              name: "Knocks Per Day",
              value: settings.knocksPerDay.toString(),
              inline: true,
            },
            {
              name: "Win Rate",
              value: settings.winRate.toString(),
              inline: true,
            },
            {
              name: "Start Date",
              value: settings.startDate
                ? settings.startDate.toISOString()
                : "None",
              inline: true,
            },
            {
              name: "End Date",
              value: settings.endDate ? settings.endDate.toISOString() : "None",
              inline: true,
            },
          ],
        },
      ],
    });
  },
);
