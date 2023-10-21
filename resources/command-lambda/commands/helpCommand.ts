/**
 * @module
 * @description Handler for the /help command
 */
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { chatCommandHandler } from "./handlers/chatCommandHandler";
import { Color } from "../../common/Color";
import { getDiscordEmbedTimestamp } from "../../common/discord/ui/getDiscordEmbedTimestamp";
import { discordService } from "../../common/discord/discordService";

export const helpCommand = chatCommandHandler(
  HalloweenCommand.Help,
  async (interaction) => {
    await discordService.updateInteractionResponse(interaction, {
      embeds: [
        {
          // TODO: Common embed format
          author: {
            name: "Luther",
            icon_url:
              "https://cdn.discordapp.com/app-icons/896600597053202462/14e838bbe4426c28377e05558c72ebd8.png?size=512",
          },
          color: Color.Primary,
          title: "Cloverse Halloween 2023 - How to Participate",
          timestamp: getDiscordEmbedTimestamp(),
          fields: [
            {
              name: "Trick or Treat",
              value: "Use the /knock command to try for a prize",
            },
            {
              name: "Connect DeviantArt",
              value:
                "Use the /deviantart command to set your DA username so we can deliver any adopts you win!",
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
            text: "Made with ❤️ by Provinite @ Github",
            icon_url:
              "https://www.dropbox.com/s/ln7f5ucr9eza8vh/clovercoin-logo_gold-gradient.png?dl=1",
          },
        },
      ],
    });
  },
);
