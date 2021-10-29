import { APIInteraction } from "discord-api-types/v9";

export class DiscordWebhookMessageUnavailableError extends Error {
  constructor(public interaction: APIInteraction) {
    super(
      `Discord webhook is unavailable. This may mean the interaction lambda took to long to respond`,
    );
  }
}
