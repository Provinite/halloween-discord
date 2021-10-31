/**
 * @module
 * @description Handler for the /info command
 */
import { guildSettingsService } from "../../common/db/guildSettingsService";
import { discordService } from "../../common/discord/discordService";
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { getDiscordEmbedAuthor } from "../../common/discord/ui/getDiscordEmbedAuthor";
import { getDiscordEmbedTimestamp } from "../../common/discord/ui/getDiscordEmbedTimestamp";
import { chatCommandHandler } from "./handlers/chatCommandHandler";
import moment = require("moment-timezone");
import { Color } from "../../common/Color";
export const infoCommand = chatCommandHandler(
  HalloweenCommand.Info,
  async (interaction) => {
    const settings = await guildSettingsService.getGuildSettings(
      interaction.guild_id,
    );
    await discordService.updateInteractionResponse(interaction, {
      embeds: [
        {
          author: getDiscordEmbedAuthor(),
          timestamp: getDiscordEmbedTimestamp(),
          color: Color.Primary,
          title: "Cloverse Halloween 2021 - Info",
          description:
            "Event information and settings. These are the current settings" +
            " for the event. Note that they may change over time" +
            " to make sure we give out all of our prizes.",
          fields: [
            {
              name: "Start Date",
              value: settings.startDate
                ? moment(settings.startDate)
                    .tz("America/Chicago")
                    .format("YYYY-MM-DD h:mm a")
                : "N/A",
            },
            {
              name: "End Date",
              value: settings.endDate
                ? moment(settings.endDate)
                    .tz("America/Chicago")
                    .format("YYYY-MM-DD h:mm a")
                : "N/A",
            },
            {
              name: "Win Rate (per knock)",
              value: settings.winRate * 100 + "%",
            },
            {
              name: "Knocks Per Day",
              value: settings.knocksPerDay.toString(),
            },
            {
              name: "Prize Pool",
              value: "/prize list",
            },
            {
              name: "Reset Time",
              value:
                moment
                  .tz("America/Chicago")
                  .hour(settings.resetTime)
                  .format("h a")
                  .toUpperCase() + " US Central Time",
            },
          ],
        },
      ],
    });
  },
);
