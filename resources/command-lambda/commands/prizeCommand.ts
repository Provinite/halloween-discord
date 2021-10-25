import { ApplicationCommandOptionType } from "discord-api-types/v9";
import {
  commandStructure,
  HalloweenCommand,
} from "../../common/discord/HalloweenCommand";
import { HalloweenDiscordError } from "../errors/HalloweenDiscordError";
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
      throw new HalloweenDiscordError({
        thrownFrom: "prizeCommand",
        message: "No subcommand provided",
        interaction,
        sourceError: new Error("Expected options on prize command, got none."),
      });
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
      throw new HalloweenDiscordError({
        thrownFrom: "prizeCommand",
        message:
          "No subcommand provided. The prize command requires a subcommand",
        interaction,
        sourceError: new Error(
          "Expected subcommand, but option was not of type subcommand",
        ),
      });
    }
    const subCommandName = subCommand.name.toLowerCase();
    const handler: ChatSubcommandHandler | undefined = (
      (isAdminCommandGroup ? adminSubCommands : subCommands) as any
    )[subCommandName as any];
    if (handler) {
      await handler(subCommand, interaction);
    } else {
      throw new HalloweenDiscordError({
        thrownFrom: "prizeCommand",
        message: "Unknown prize sub command",
        interaction,
        sourceError: new Error(
          `No handler found for prize subcommand ${subCommandName}`,
        ),
      });
    }
  },
);
