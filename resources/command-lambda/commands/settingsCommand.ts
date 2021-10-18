import { ApplicationCommandOptionType } from "discord-api-types/v9";
import {
  commandStructure,
  HalloweenCommand,
} from "../../common/discord/HalloweenCommand";
import { isKeyOf } from "../../common/isKeyOf";
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
      // TODO: Error handling
      return;
    }
    const [subCommand] = options;
    if (subCommand.type !== ApplicationCommandOptionType.Subcommand) {
      // TODO: Error handling
      return;
    }
    const subCommandName = subCommand.name.toLowerCase();
    if (isKeyOf(subCommandName, subCommands)) {
      await subCommands[subCommandName](subCommand, interaction);
    } else {
      // TODO: Error handling
      return;
    }
  },
);
