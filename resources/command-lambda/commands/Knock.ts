import { getClientCredentialsToken } from "../../common/discord/getClientCredentialsToken";
import { updateInteractionResponse } from "../../common/discord/updateInteractionResponse";
import { HalloweenCommand } from "../HalloweenCommand";
import { handlerFor } from "./handlerFor";

export const KnockCommand = handlerFor(
  HalloweenCommand.Knock,
  async (interaction) => {
    const token = await getClientCredentialsToken();
    await updateInteractionResponse(token, interaction.token, {
      content: "Looks like you could use some knock.",
    });
  },
);
