import { APIApplicationCommandGuildInteraction } from "discord-api-types/v9";
import { isGuildInteraction } from "discord-api-types/utils/v9";
import { HelpCommand } from "./commands/Help";
import { InfoCommand } from "./commands/Info";
import { KnockCommand } from "./commands/Knock";
import { HalloweenCommand } from "./HalloweenCommand";
import { getClientCredentialsToken } from "../common/discord/getClientCredentialsToken";
import { updateInteractionResponse } from "../common/discord/updateInteractionResponse";

export type CommandLambdaEvent = {
  body: APIApplicationCommandGuildInteraction;
};
// TODO: Wrap handler in an error-handler that will
// complete the interaction
export const handler = async (event: CommandLambdaEvent): Promise<void> => {
  console.log({ event });
  // TODO: Can we use the discord API to verify
  // that the interaction is still ok?
  const { body } = event;
  if (isGuildInteraction(body)) {
    const commandName = body.data.name.toLowerCase();
    const commands = {
      [HalloweenCommand.Knock]: KnockCommand,
      [HalloweenCommand.Info]: InfoCommand,
      [HalloweenCommand.Help]: HelpCommand,
    } as const;

    const handler = commands[commandName as HalloweenCommand];
    if (!handler) {
      const token = await getClientCredentialsToken();
      await updateInteractionResponse(token, event.body.token, {
        content: "Unknown command, use /help for details",
      } as any);
      return;
    }
    await handler(body);
  }
};
