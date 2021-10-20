import { ApplicationCommandOptionType } from "discord-api-types/v9";
import {
  commandStructure,
  HalloweenCommand,
} from "../../common/discord/HalloweenCommand";
import { chatCommandHandler } from "./handlers/chatCommandHandler";
import { ChatSubcommandHandler } from "./handlers/chatSubcommandHandler";
import { addPrizeSubCommand } from "./prize/addPrizeSubCommand";
import { listPrizesSubCommand } from "./prize/listPrizesSubCommand";

const adminSubCommands = {
  [commandStructure[HalloweenCommand.Prize].Admin.Add]: addPrizeSubCommand,
};

const subCommands = {
  [commandStructure[HalloweenCommand.Prize].List]: listPrizesSubCommand,
};

export const prizeCommand = chatCommandHandler(
  HalloweenCommand.Prize,
  async (interaction) => {
    const { options } = interaction.data;
    if (!options || !options.length) {
      // TODO: Error handling
      return;
    }
    let [subCommand] = options;
    let isAdminCommandGroup = false;
    if (
      subCommand.type === ApplicationCommandOptionType.SubcommandGroup &&
      subCommand.name === "admin"
    ) {
      isAdminCommandGroup = true;
      subCommand = subCommand.options[0];
    }
    if (subCommand.type !== ApplicationCommandOptionType.Subcommand) {
      // TODO: Error handling
      return;
    }
    const subCommandName = subCommand.name.toLowerCase();
    const handler: ChatSubcommandHandler | undefined = (
      (isAdminCommandGroup ? adminSubCommands : subCommands) as any
    )[subCommandName as any];
    if (handler) {
      await handler(subCommand, interaction);
    } else {
      // TODO: Error handling
      return;
    }
  },
);
