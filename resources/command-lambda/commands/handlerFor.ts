import { APIApplicationCommandGuildInteraction } from "discord-api-types/v9";
import { HalloweenCommand } from "../HalloweenCommand";

export function handlerFor<T extends HalloweenCommand>(
  command: T,
  handler: (
    interaction: APIApplicationCommandGuildInteraction,
  ) => Promise<void>,
) {
  return async (
    interaction: APIApplicationCommandGuildInteraction,
  ): Promise<void> => {
    if (interaction.data.name.toLowerCase() !== command) {
      throw new Error(
        `Command Handler: Expected command "${command}", got "${interaction.data.name}"`,
      );
    }
    return handler(interaction);
  };
}
