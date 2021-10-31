import { randomInt } from "crypto";
import { APIEmbedAuthor } from "discord-api-types/v9";
import { envService } from "../../envService";

export function getDiscordEmbedAuthor(): APIEmbedAuthor {
  const authorIndex = randomInt(0, 11);
  return {
    name: authorIndex > 5 ? "Luther" : "Daphne",
    icon_url: `${envService.getImageBucketUrl()}icon/${authorIndex}.png`,
  };
}
