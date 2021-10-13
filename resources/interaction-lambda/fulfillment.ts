import { SQS } from "aws-sdk";
import { APIApplicationCommandGuildInteraction } from "discord-api-types";
import createHttpError = require("http-errors");
import { FulfillmentMessageBody } from "../common/fulfillment/FulfillmentMessageBody";
import { envService } from "./EnvService";

export async function sendFulfillmentMessage(
  interaction: APIApplicationCommandGuildInteraction,
  requestTimestamp: number,
): Promise<void> {
  if (!interaction.guild_id) {
    throw new createHttpError[400]("Interaction is missing guild id");
  }
  if (!interaction.member) {
    throw new createHttpError[400]("Interaction is missing member");
  }
  if (!interaction.member.user || !interaction.member.user.id) {
    throw new createHttpError[400]("Interaction is missing member user id");
  }
  if (!interaction.token) {
    throw new createHttpError[400]("Interaction is missing token");
  }
  const sqs = new SQS();
  const messageBody: FulfillmentMessageBody = {
    guildId: interaction.guild_id,
    userId: interaction.member.user.id,
    token: interaction.token,
    interactionId: interaction.id,
    requestTimestamp,
  };
  await sqs
    .sendMessage({
      MessageBody: JSON.stringify(messageBody),
      QueueUrl: envService.getFulfillmentQueueUrl(),
      MessageGroupId: interaction.guild_id,
      MessageDeduplicationId: `${interaction.guild_id}+${interaction.member.user.id}+${requestTimestamp}`,
    })
    .promise();
}
