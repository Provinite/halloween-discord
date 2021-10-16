import { APIPingInteraction, InteractionType } from "discord-api-types/v9";

export function isPingInteraction(body: unknown): body is APIPingInteraction {
  return (
    Boolean(body) && (body as APIPingInteraction).type === InteractionType.Ping
  );
}
