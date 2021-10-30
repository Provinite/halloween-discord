/**
 * @module
 * @description Handler for the /credits command
 */
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { chatCommandHandler } from "./handlers/chatCommandHandler";
import { APIEmbedField } from "discord-api-types/v9";
import { commandLambdaLogger } from "../util/commandLambdaLogger";
import { getDiscordEmbedTimestamp } from "../../common/discord/ui/getDiscordEmbedTimestamp";
import { discordService } from "../../common/discord/discordService";
import { Color } from "../../common/Color";
import { getDiscordEmbedAuthor } from "../../common/discord/ui/getDiscordEmbedAuthor";

export const creditsCommand = chatCommandHandler(
  HalloweenCommand.Credits,
  async (interaction) => {
    const credits = [
      { name: "A2J", credit: "Artwork, Planning" },
      { name: "Provinite", credit: "Software, Planning" },
      {
        name: "Pesky Potato",
        credit: "Software",
      },
      {
        name: "EmmyGoat",
        credit: "TODO",
      },
      {
        name: "SpiritBurn",
        credit: "TODO",
      },
      {
        name: "PeaBandJ",
        credit: "TODO",
      },
    ];

    /**
     * Array for dynamic credit generation. Every third element should be our special "empty" inline element.
     */
    const fields: APIEmbedField[] = [];
    for (let i = 0; i < credits.length; i++) {
      const field: APIEmbedField = {
        name: credits[i].name,
        value: credits[i].credit,
        inline: true,
      };
      fields.push(field);
      if (i % 2 === 1) {
        fields.push({ name: "\u200B", value: "\u200B", inline: true });
      }
    }

    commandLambdaLogger.info({
      message: "Sending credits response",
    });

    await discordService.updateInteractionResponse(interaction, {
      embeds: [
        {
          author: getDiscordEmbedAuthor(),
          color: Color.Primary,
          title: "Cloverse Halloween 2021 - Credits",
          timestamp: getDiscordEmbedTimestamp(),
          fields,
        },
      ],
    });
  },
);
