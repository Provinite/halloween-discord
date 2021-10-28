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
import { prizeCommand } from "./commands/prizeCommand";
import { settingsCommand } from "./commands/settingsCommand";
import { interactionContext } from "../common/discord/interactionContext";
import { errorHandler } from "./commands/errorHandler";
import { creditsCommand } from "./commands/creditsCommand";
import { commandLambdaLogger } from "./util/commandLambdaLogger";
import { HalloweenDiscordError } from "./errors/HalloweenDiscordError";
import { closeKnex } from "../common/db/client";

export type CommandLambdaEvent = {
  body: APIApplicationCommandGuildInteraction;
};
// TODO: Wrap handler in an error-handler that will
// complete the interaction

export const handler = async (event: CommandLambdaEvent): Promise<void> => {
  await interactionContext.run(event.body, async () => {
    try {
      commandLambdaLogger.info({
        message: "Lambda invoked",
        event,
      });
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
          [HalloweenCommand.Credits]: creditsCommand,
        } as const;

        const handler = commands[commandName as HalloweenCommand];
        if (!handler) {
          throw new HalloweenDiscordError({
            thrownFrom: "command-lambda",
            sourceError: new Error(`Unknown command: ${commandName}`),
            message: `Unknown command, use /help for details`,
          });
        }
        await handler(body);
      }
    } catch (error) {
      await errorHandler(error as Error);
    } finally {
      await closeKnex();
    }
  });
};
