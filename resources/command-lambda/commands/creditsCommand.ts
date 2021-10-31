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

const specialThanksGroups = {
  helpers: "230685975653777409",
  mods: "230670492539813888",
  patreon: "808143046381404191",
  patronSpeedpaint: "277238776781209601",
  patronMerch: "277238728630599681",
  patronEvents: "277238676822556682",
  patronDibs: "277238542638514176",
  patronTips: "277238448698556419",
};

export const creditsCommand = chatCommandHandler(
  HalloweenCommand.Credits,
  async (interaction) => {
    const credits = [
      { credit: "Idea & Planning", names: ["CloverCoin", "Provinite"] },
      { credit: "Software Engineering", names: ["Provinite @ Github"] },
      {
        credit: "Assistant _to the_ Senior Engineer",
        names: ["LarsonDanes @ Github"],
      },
      {
        credit: "Artwork & Organization",
        names: [
          "SpiritBurn",
          "Baylee",
          "CloverCoin",
          "ethereal-dancer",
          "fishyyllama",
          "MonsterMillie",
          "Neo the Baka",
          "PeaBandJ",
          "PixelRaccoon",
          "Zach-liversonthemoon",
        ],
      },
      {
        credit: "Special Thanks",
        names: Object.values(specialThanksGroups).map(
          (roleId) => `<@&${roleId}>`,
        ),
      },
    ];

    /**
     * Array for dynamic credit generation. Every third element should be our special "empty" inline element.
     */
    const fields: APIEmbedField[] = [];
    for (let i = 0; i < credits.length; i++) {
      const field: APIEmbedField = {
        name: credits[i].credit,
        value: credits[i].names.join(", "),
      };
      fields.push(field);
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
