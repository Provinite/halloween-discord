import { APIGatewayProxyResult } from "aws-lambda";

export function apiGatewayResult<T>(
  result: Omit<APIGatewayProxyResult, "body"> & { body: T },
): APIGatewayProxyResult {
  return { ...result, body: JSON.stringify(result.body, null, 2) };
}
