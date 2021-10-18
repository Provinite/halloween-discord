import {
  APIChatInputApplicationCommandGuildInteraction,
  ApplicationCommandInteractionDataOptionSubCommand,
} from "discord-api-types/v9";
import { knex } from "../../../common/db/client";
import { HalloweenTable } from "../../../common/db/TableName";
import { getClientCredentialsToken } from "../../../common/discord/getClientCredentialsToken";
import {
  commandStructure,
  HalloweenCommand,
} from "../../../common/discord/HalloweenCommand";
import { updateInteractionResponse } from "../../../common/discord/updateInteractionResponse";

export const listSettingsSubCommand = async (
  subCommand: ApplicationCommandInteractionDataOptionSubCommand,
  interaction: APIChatInputApplicationCommandGuildInteraction,
): Promise<void> => {
  if (subCommand.name !== commandStructure[HalloweenCommand.Settings].List) {
    throw new Error("Expected settings list subcommand");
  }
  const settings = await knex(HalloweenTable.GuildSettings)
    .select("*")
    .where({
      guildId: interaction.guild_id,
    })
    .first();
  if (!settings) {
    await updateInteractionResponse(
      await getClientCredentialsToken(),
      interaction.token,
      {
        content:
          "Looks like settings haven't been configured for this server yet",
      },
    );
    return;
  }

  await updateInteractionResponse(
    await getClientCredentialsToken(),
    interaction.token,
    {
      embeds: [
        {
          title: "[Admin] Event Settings",
          timestamp: new Date().toISOString(),
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
    },
  );
};
