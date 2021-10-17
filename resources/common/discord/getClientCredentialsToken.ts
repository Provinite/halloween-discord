import axios, { AxiosResponse } from "axios";
import { RESTPostOAuth2ClientCredentialsResult } from "discord-api-types/rest/v9";
import { URLSearchParams } from "url";
import { isAxiosError } from "../axios/isAxiosError";
import { envService } from "../envService";
import { logger } from "../log";

// PERF: Reusing tokens would be smart. Maybe through SSM?
// At the very least, store it for warm invocations
export async function getClientCredentialsToken(): Promise<string> {
  const appId = envService.getDiscordApplicationId();
  const secret = envService.getDiscordClientSecret();

  const data = new URLSearchParams();
  data.append("grant_type", "client_credentials");
  data.append("scope", "identify");
  // TODO: Make a bot for this
  let response: AxiosResponse<RESTPostOAuth2ClientCredentialsResult>;
  try {
    response = await axios.post<URLSearchParams, AxiosResponse<any>>(
      "https://discord.com/api/oauth2/token",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        auth: {
          username: appId,
          password: secret,
        },
      },
    );
  } catch (err) {
    if (isAxiosError(err)) {
      logger.error({
        message: `Failed communicating with the discord API (${err.name}): ${err.message}`,
        url: err.config.url,
        responseData: err.response?.data,
        requestBody: err.config.data,
      });
    }
    throw err;
  }
  return response.data.access_token;
}
