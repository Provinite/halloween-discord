/**
 * @module
 * @description Lambda function that handles incoming Application Commands invocations.
 *  Invoked asynchronously by the interaction lambda. Event data should be an object
 *  with a body key whose value is the entire POST body for the initial webhook hit.
 */
import { APIApplicationCommandGuildInteraction } from "discord-api-types/v9";
import { isGuildInteraction } from "discord-api-types/utils/v9";
import { helpCommand } from "./commands/helpCommand";
import { infoCommand } from "./commands/infoCommand";
import { knockCommand } from "./commands/knockCommand";
import { HalloweenCommand } from "../common/discord/HalloweenCommand";
import { getClientCredentialsToken } from "../common/discord/getClientCredentialsToken";
import { updateInteractionResponse } from "../common/discord/updateInteractionResponse";
import { logger } from "../common/log";
import { prizeCommand } from "./commands/prizeCommand";
import { settingsCommand } from "./commands/settingsCommand";

export type CommandLambdaEvent = {
  body: APIApplicationCommandGuildInteraction;
};
// TODO: Wrap handler in an error-handler that will
// complete the interaction
export const handler = async (event: CommandLambdaEvent): Promise<void> => {
  logger.log({ event });
  // TODO: Can we use the discord API to verify
  // that the interaction is still ok?
  const { body } = event;
  if (isGuildInteraction(body)) {
    const commandName = body.data.name.toLowerCase();
    const commands = {
      [HalloweenCommand.Knock]: knockCommand,
      [HalloweenCommand.Info]: infoCommand,
      [HalloweenCommand.Help]: helpCommand,
      [HalloweenCommand.Prize]: prizeCommand,
      [HalloweenCommand.Settings]: settingsCommand,
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
