import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from "discord-api-types/v9";
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { hasPermissionFlag } from "../../common/discord/hasPermissionFlag";
import { HalloweenDiscordError } from "../errors/HalloweenDiscordError";
import { commandLambdaLogger } from "../util/commandLambdaLogger";
import { chatCommandHandler } from "./handlers/chatCommandHandler";
import { knockCommand } from "./knockCommand";

export const adminknockCommand = chatCommandHandler(
  HalloweenCommand.AdminKnock,
  async (interaction) => {
    if (
      !hasPermissionFlag(
        interaction.member.permissions,
        PermissionFlagsBits.Administrator,
      )
    ) {
      throw new HalloweenDiscordError({
        thrownFrom: "adminKnockCommand",
        message: "You lack the required permissions for that command.",
        interaction,
        sourceError: new Error(
          `Invalid permissions when attempting to process command ${HalloweenCommand.AdminKnock}`,
        ),
      });
    }
    if (!interaction.data.options || !interaction.data.options.length) {
      throw new HalloweenDiscordError({
        thrownFrom: "adminKnockCommand",
        message:
          "You must provide a target user for the " +
          HalloweenCommand.AdminKnock +
          " command",
        interaction,
        sourceError: new Error(
          `No interaction options provided for command ${HalloweenCommand.AdminKnock}`,
        ),
      });
    }
    const [option] = interaction.data.options;
    if (option.type !== ApplicationCommandOptionType.User) {
      throw new HalloweenDiscordError({
        thrownFrom: "adminKnockCommand",
        message:
          "You must provide a target user for the " +
          HalloweenCommand.AdminKnock +
          " command",
        interaction,
        sourceError: new Error(
          `Got a non-user option in the first slot for command ${HalloweenCommand.AdminKnock}`,
        ),
      });
    }
    const phonyInteraction: typeof interaction = {
      ...interaction,
      data: {
        ...interaction.data,
        name: HalloweenCommand.Knock,
      },
      member: {
        ...interaction.member,
        user: { ...interaction.member.user, id: option.value },
      },
    };

    commandLambdaLogger.info({
      message:
        "Processing phony knock command, secondary to admin knock command",
      phonyInteraction,
      targetUser: option.value,
      user: interaction.member.user.id,
    });
    return knockCommand(phonyInteraction);
  },
);
