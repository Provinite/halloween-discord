import {
  APIApplicationCommandInteraction,
  InteractionType,
} from "discord-api-types/v9";

export function isApplicationCommandInteraction(
  body: unknown,
): body is APIApplicationCommandInteraction {
  return (
    Boolean(body) &&
    (body as APIApplicationCommandInteraction).type ===
      InteractionType.ApplicationCommand
  );
}
