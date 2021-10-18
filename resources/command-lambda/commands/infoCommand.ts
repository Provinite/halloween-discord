/**
 * @module
 * @description Handler for the /info command
 */
import { getClientCredentialsToken } from "../../common/discord/getClientCredentialsToken";
import { updateInteractionResponse } from "../../common/discord/updateInteractionResponse";
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { chatCommandHandler } from "./handlers/chatCommandHandler";

export const infoCommand = chatCommandHandler(
  HalloweenCommand.Info,
  async (interaction) => {
    const token = await getClientCredentialsToken();
    await updateInteractionResponse(token, interaction.token, {
      content: "Looks like you could use some info.",
    });
  },
);
