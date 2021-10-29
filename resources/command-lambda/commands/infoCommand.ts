/**
 * @module
 * @description Handler for the /info command
 */
import { discordService } from "../../common/discord/discordService";
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { chatCommandHandler } from "./handlers/chatCommandHandler";

export const infoCommand = chatCommandHandler(
  HalloweenCommand.Info,
  async (interaction) => {
    await discordService.updateInteractionResponse(interaction, {
      content: "Looks like you could use some info.",
    });
  },
);
