import { KnockEvent } from "../../common/db/RecordType";
import { SQS } from "aws-sdk";
import { captureAWSClient } from "aws-xray-sdk-core";
import moment = require("moment");
import { APIChatInputApplicationCommandGuildInteraction } from "discord-api-types/v9";
import { envService } from "../../common/envService";
export async function sendFulfillmentMessage(
  interaction: APIChatInputApplicationCommandGuildInteraction,
  knockEventId: KnockEvent["id"],
): Promise<void> {
  const sqs = captureAWSClient(new SQS());
  const messageBody: FulfillmentMessageBody = {
    token: interaction.token,
    interaction,
    timestamp: moment().unix(),
    knockEventId,
  };
  await sqs
    .sendMessage({
      MessageBody: JSON.stringify(messageBody),
      QueueUrl: envService.getFulfillmentQueueUrl(),
      MessageGroupId: interaction.guild_id,
      MessageDeduplicationId: knockEventId.toString(),
    })
    .promise();
}

export interface FulfillmentMessageBody {
  knockEventId: KnockEvent["id"];
  token: string;
  interaction: APIChatInputApplicationCommandGuildInteraction;
  timestamp: number;
}
