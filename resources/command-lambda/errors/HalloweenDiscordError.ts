import {
  APIInteraction,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from "discord-api-types/v9";
import { hexStringToInt } from "../../common/hexStringToInt";
import { DiscordReportableError } from "./DiscordReportableError";

export class HalloweenDiscordError extends DiscordReportableError {
  constructor({
    thrownFrom,
    message,
    interaction,
    sourceError,
  }: {
    thrownFrom: string;
    message: string;
    interaction?: APIInteraction;
    sourceError: Error;
  }) {
    super(message, {
      sourceError,
      errorsLambda: true,
      interaction,
      message,
      name: "HalloweenDiscordError",
      thrownFrom,
    });
  }

  getDiscordResponseBody(): RESTPatchAPIInteractionOriginalResponseJSONBody {
    const interaction = this.getInteraction();
    const message = this.config.message;
    return {
      embeds: [
        {
          // TODO: Common embed format
          author: {
            name: "Luther",
            icon_url:
              "https://cdn.discordapp.com/app-icons/896600597053202462/14e838bbe4426c28377e05558c72ebd8.png?size=512",
          },
          timestamp: new Date().toISOString(),
          color: hexStringToInt("FF0000"),
          footer: {
            text: `Reference Code: ${interaction.id}`,
          },
          title: "Cloverse Halloween 2021 - Error",
          description: "Something went wrong",
          fields: [
            {
              name: "Message",
              value: message,
            },
          ],
        },
      ],
    };
  }
}
