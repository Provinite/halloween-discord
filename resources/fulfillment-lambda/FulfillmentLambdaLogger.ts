import { interactionContext } from "../common/discord/interactionContext";
import { Logger } from "../common/Logger";

export class FulfillmentLambdaLogger extends Logger {
  constructor(parentLogger?: Logger, additionalLogProps?: any) {
    super(parentLogger, additionalLogProps);
  }

  protected getAdditionalContextLogProps(): any {
    const interaction = interactionContext.getStore();
    if (interaction) {
      return {
        source: "command-lambda",
        interactionId: interaction.id,
        guildId: interaction.guild_id,
        userId: interaction.member?.user.id,
      };
    } else {
      return {
        source: "command-lambda",
      };
    }
  }
}

export const fulfillmentLambdaLogger = new FulfillmentLambdaLogger();
