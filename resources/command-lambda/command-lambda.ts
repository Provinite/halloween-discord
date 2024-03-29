/**
 * @module
 * @description Lambda function that handles incoming Application Commands invocations.
 *  Invoked asynchronously by the interaction lambda. Event data should be an object
 *  with a body key whose value is the entire POST body for the initial webhook hit.
 */
import "../common/xray/instrumentOutboundHttps";

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
import { discordService } from "../common/discord/discordService";
import { giftyCommand } from "./commands/giftyCommand";
import { adminknockCommand } from "./commands/adminKnockCommand";
import { testWinCommand } from "./commands/testWinCommand";
import { deviantArtCommand } from "./commands/deviantArtCommand";

export type CommandLambdaEvent = {
  body: APIApplicationCommandGuildInteraction;
};

export const actualHandler = async (
  event: CommandLambdaEvent,
): Promise<void> => {
  await interactionContext.run(event.body, async () => {
    try {
      commandLambdaLogger.info({
        message: "Lambda invoked",
        event,
      });
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
          [HalloweenCommand.Gifty]: giftyCommand,
          [HalloweenCommand.AdminKnock]: adminknockCommand,
          [HalloweenCommand.TestWin]: testWinCommand,
          [HalloweenCommand.DeviantArt]: deviantArtCommand,
        } as const;

        // before processing, check if the interaction lambda responded in time
        // we need to chill for a sec here. This isn't the best approach but
        // otherwise sometimes discord 404's the interaction response.
        await sleep(500);
        const response = await discordService.getInteractionResponse(body);
        commandLambdaLogger.info({
          message: "Interaction response received",
          response,
        });
        const handler = commands[commandName as HalloweenCommand];
        if (!handler) {
          throw new HalloweenDiscordError({
            thrownFrom: "command-lambda",
            sourceError: new Error(`Unknown command: ${commandName}`),
            message: `Unknown command, use /help for details`,
          });
        }
        commandLambdaLogger.info({
          message: "Running command: " + commandName,
        });
        await handler(body);
        commandLambdaLogger.info({
          message: "Finished running command: " + commandName,
        });
      }
    } catch (error) {
      await errorHandler(error as Error);
    } finally {
      commandLambdaLogger.info({
        message: "Closing knex pool",
      });
      await closeKnex();
    }
  });
  commandLambdaLogger.info({
    message: "Interaction context closed",
  });
};

export function handler(
  event: any,
  ctx: any,
  callback: (err?: Error) => void,
): void {
  actualHandler(event).then(() => callback(), callback);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
