import { APIGatewayProxyResult } from "aws-lambda";
import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
} from "discord-api-types";
import createHttpError = require("http-errors");
import { apiGatewayResult } from "../lambda/apiGatewayResult";

export async function knockCommand(
  interaction: APIInteraction,
): Promise<APIGatewayProxyResult> {
  if (interaction.type !== InteractionType.ApplicationCommand) {
    throw new createHttpError[500](
      "Invalid interaction type for knock command, expected ApplicationCommand",
    );
  }

  if (!interaction.member) {
    return apiGatewayResult<APIInteractionResponse>({
      statusCode: 200,
      body: {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "This command is not available in DMs",
        },
      },
    });
  }

  const winrate = 1;

  if (Math.random() > winrate) {
    // ACK that snizz
    return apiGatewayResult<APIInteractionResponse>({
      statusCode: 200,
      body: {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      },
    });
  }

  return apiGatewayResult<APIInteractionResponse>({
    statusCode: 200,
    body: {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "Boom'd em!",
      },
    },
  });
}
