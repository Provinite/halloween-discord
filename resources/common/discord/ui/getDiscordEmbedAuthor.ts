import { APIEmbedAuthor } from "discord-api-types/v9";

export function getDiscordEmbedAuthor(): APIEmbedAuthor {
  return {
    name: "Luther",
    icon_url:
      "https://cdn.discordapp.com/app-icons/896600597053202462/14e838bbe4426c28377e05558c72ebd8.png?size=512",
  };
}
