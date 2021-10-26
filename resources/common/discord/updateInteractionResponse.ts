import axios, { AxiosResponse } from "axios";
import {
  RESTPatchAPIInteractionOriginalResponseJSONBody,
  RESTPatchAPIInteractionOriginalResponseResult,
} from "discord-api-types/v9";
import { isAxiosError } from "../axios/isAxiosError";
import { envService } from "../envService";
import { logger } from "../Logger";

/**
 * @see https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 * @param authToken A bearer token for authorizing the call.
 * @param interactionToken The interaction token supplied with the initial webhook call
 * @param body The PATCH body
 * @returns
 */
export async function updateInteractionResponse(
  authToken: string,
  interactionToken: string,
  body: RESTPatchAPIInteractionOriginalResponseJSONBody,
): Promise<RESTPatchAPIInteractionOriginalResponseResult> {
  const appId = envService.getDiscordApplicationId();
  try {
    const authHeader = `Bearer ${authToken}`;
    const response = await axios.patch<
      RESTPatchAPIInteractionOriginalResponseJSONBody,
      AxiosResponse<RESTPatchAPIInteractionOriginalResponseResult>
    >(
      `https://discord.com/api/webhooks/${appId}/${interactionToken}/messages/@original`,
      body,
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
