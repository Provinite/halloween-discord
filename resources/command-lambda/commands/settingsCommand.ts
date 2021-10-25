import { ApplicationCommandOptionType } from "discord-api-types/v9";
import {
  commandStructure,
  HalloweenCommand,
} from "../../common/discord/HalloweenCommand";
import { isKeyOf } from "../../common/isKeyOf";
import { HalloweenDiscordError } from "../errors/HalloweenDiscordError";
import { chatCommandHandler } from "./handlers/chatCommandHandler";
import { listSettingsSubCommand } from "./settings/listSettingsSubCommand";
import { setSettingsSubCommand } from "./settings/setSettingSubCommand";

const subCommands = {
  [commandStructure[HalloweenCommand.Settings].Set]: setSettingsSubCommand,
  [commandStructure[HalloweenCommand.Settings].List]: listSettingsSubCommand,
};

export const settingsCommand = chatCommandHandler(
  HalloweenCommand.Settings,
  async (interaction) => {
    const { options } = interaction.data;
    if (!options || !options.length) {
      throw new HalloweenDiscordError({
        thrownFrom: "settingsCommand",
        message: "No subcommand provided",
        interaction,
        sourceError: new Error(
          "Expected options on settings command, got none.",
        ),
      });
    }
    const [subCommand] = options;
    if (subCommand.type !== ApplicationCommandOptionType.Subcommand) {
      throw new HalloweenDiscordError({
        thrownFrom: "settingsCommand",
        message:
          "No subcommand provided. The settings command requires a subcommand",
        interaction,
        sourceError: new Error(
          "Expected subcommand, but option was not of type subcommand",
        ),
      });
    }
    const subCommandName = subCommand.name.toLowerCase();
    if (isKeyOf(subCommandName, subCommands)) {
      await subCommands[subCommandName](subCommand, interaction);
    } else {
      throw new HalloweenDiscordError({
        thrownFrom: "settingsCommand",
        message: "Unknown settings sub command",
        interaction,
        sourceError: new Error(
          `No handler found for settings subcommand ${subCommandName}`,
        ),
      });
    }
  },
);
