/**
 * @module
 * @description Handler for the /credits command
 */
import { getClientCredentialsToken } from "../../common/discord/getClientCredentialsToken";
import { updateInteractionResponse } from "../../common/discord/updateInteractionResponse";
import { hexStringToInt } from "../../common/hexStringToInt";
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { chatCommandHandler } from "./handlers/chatCommandHandler";
import { APIEmbedField } from "discord-api-types";
import { commandLambdaLogger } from "../util/commandLambdaLogger";

export const creditsCommand = chatCommandHandler(
  HalloweenCommand.Credits,
  async (interaction) => {
    const token = await getClientCredentialsToken();

    const credits = [
      { name: "A2J", credit: "Biiiig brains" },
      { name: "Provinite", credit: "OK brains, biiiiig attitude" },
      {
        name: "Dimmy",
        credit: "Brains: [] | Attitude: [] | Dimmy: [x]",
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

    await updateInteractionResponse(token, interaction.token, {
      embeds: [
        {
          author: {
            name: "Luther",
            icon_url:
              "https://cdn.discordapp.com/app-icons/896600597053202462/14e838bbe4426c28377e05558c72ebd8.png?size=512",
          },
          color: hexStringToInt("EB6123"),
          title: "Cloverse Halloween 2021 - Credits",
          timestamp: new Date().toISOString(),
          fields,
        },
      ],
    });
  },
);
