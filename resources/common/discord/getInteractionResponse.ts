import axios, { AxiosResponse } from "axios";
import {
  APIInteraction,
  RESTGetAPIWebhookWithTokenMessageResult,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from "discord-api-types/v9";
import { isAxiosError } from "../axios/isAxiosError";
import { envService } from "../envService";
import { DiscordWebhookMessageUnavailableError } from "../errors/DiscordWebhookMessageUnavailable";
import { logger } from "../Logger";

/**
 * Fetch the original webhook response message for the interaction.
 * @param authToken A bearer token for authorizing the call.
 * @param interaction The interaction to fetch the message for.
 * @returns The interaction response. Throws a DiscordWebhookMessageUnavailableError otherwise.
 */
export async function getInteractionResponse(
  authToken: string,
  interaction: APIInteraction,
): Promise<RESTGetAPIWebhookWithTokenMessageResult> {
  // TODO: Logger context
  const appId = envService.getDiscordApplicationId();

  try {
    const authHeader = `Bearer ${authToken}`;
    const response = await axios.get<
      RESTPatchAPIInteractionOriginalResponseJSONBody,
      AxiosResponse<RESTGetAPIWebhookWithTokenMessageResult>
    >(
      `https://discord.com/api/webhooks/${appId}/${interaction.token}/messages/@original`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      },
    );
    return response.data;
  } catch (err: any) {
    if (isAxiosError(err)) {
      if (err.response && err.response?.status) {
        // This is probably because the interaction lambda took too long to respond.
        logger.error({
          message: `Failed getting interaction response. (HTTP ${err.response.status}) (${err.name}): ${err.message}. This is likely because the interaction lambda took to long to respond`,
          url: err.config.url,
          responseData: err.response.data,
          requestBody: err.config.data,
          resposneStatus: err.response.status,
        });
        throw new DiscordWebhookMessageUnavailableError(interaction);
      }
      logger.error({
        message: `Failed communicating with the discord API (${err.name}): ${err.message}`,
        url: err.config.url,
        responseData: err.response?.data,
        requestBody: err.config.data,
      });
      throw err;
    } else if (err) {
      const errAny = err as any;
      logger.error({
        message: `Failed communicating with the discord API: ${errAny.message}`,
        errorName: errAny.name,
        stack: errAny.stack,
      });
      throw err;
    } else {
      logger.error({
        name: "name" in err ? err.name : "Unknown",
      });
      throw new Error(
        "Unknown failure while trying to communicate with the discord API",
      );
    }
  }
}
