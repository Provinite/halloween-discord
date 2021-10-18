/**
 * @module
 * @description Handler for the /help command
 */
import { getClientCredentialsToken } from "../../common/discord/getClientCredentialsToken";
import { updateInteractionResponse } from "../../common/discord/updateInteractionResponse";
import { hexStringToInt } from "../../common/hexStringToInt";
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { chatCommandHandler } from "./handlers/chatCommandHandler";

export const helpCommand = chatCommandHandler(
  HalloweenCommand.Help,
  async (interaction) => {
    const token = await getClientCredentialsToken();
    await updateInteractionResponse(token, interaction.token, {
      embeds: [
        {
          author: {
            name: "Luther",
            icon_url:
              "https://cdn.discordapp.com/app-icons/896600597053202462/14e838bbe4426c28377e05558c72ebd8.png?size=512",
          },
          color: hexStringToInt("EB6123"),
          title: "Cloverse Halloween 2021 - How to Participate",
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Trick or Treat",
              value: "Use the /knock command to try for a prize",
            },
            {
              name: "Issues?",
              value:
                "If you're experiencing any bugs or issues please contact one of the event administrators for help.",
            },
            {
              name: "Want more info?",
              value:
                "You can get details about the event by using the /info command",
            },
            {
              name: "Want to see the juicy prizes?",
              value: "Use the /prize list command to see what you could win!",
            },
          ],
          // TODO: # of knocks per day
          description:
            "Every day until the event is over, you'll have the opportunity to knock on our door a few times for a chance to win fabulous prizes.",
          footer: {
            text: "Made with <:pillowSunglasses:328545569179959319> by [Provinite @ Github](https://github.com/provinite)",
          },
        },
      ],
    });
  },
);
