import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import Handlebars = require("handlebars");
import { knockEventService } from "../common/db/knockEventService";
import { apiGatewayResult } from "../common/lambda/apiGatewayResult";
import { indexTemplate } from "./index.template";

Handlebars.registerHelper("rowIndex", (index: string) => {
  const idx = Number(index);
  if (isNaN(idx) || typeof idx !== "number") {
    return "";
  }
  return idx + 1;
});

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> => {
  const { httpMethod } = event;
  if (httpMethod.toLowerCase() === "get") {
    // TODO: This is all untested
    // TODO: Need to deploy this lambda and give it a URL
    const wins = await knockEventService.getWinnersTable("904235254225731634");

    const format = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZoneName: "short",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const result = Handlebars.compile(indexTemplate)({
      wins: wins.map((win) => ({
        ...win,
        time: format.format(win.time),
      })),
    });
    return apiGatewayResult(
      {
        body: result,
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
      },
      false,
    );
  }

  return apiGatewayResult({
    body: "method not allowed",
    statusCode: 405,
  });
};
