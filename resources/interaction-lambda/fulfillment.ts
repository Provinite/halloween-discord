import { SQS } from "aws-sdk";
import { APIApplicationCommandGuildInteraction } from "discord-api-types/v9";
import createHttpError = require("http-errors");
import { FulfillmentMessageBody } from "../common/fulfillment/FulfillmentMessageBody";

export async function sendFulfillmentMessage(
  interaction: APIApplicationCommandGuildInteraction,
  requestTimestamp: number,
): Promise<void> {
  throw new Error("Not implemented.");
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
      QueueUrl: "TODO",
      MessageGroupId: interaction.guild_id,
      MessageDeduplicationId: `${interaction.guild_id}+${interaction.member.user.id}+${requestTimestamp}`,
    })
    .promise();
}
