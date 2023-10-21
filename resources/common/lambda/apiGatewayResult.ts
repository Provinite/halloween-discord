import { APIGatewayProxyResult } from "aws-lambda";

export function apiGatewayResult<T>(
  result: Omit<APIGatewayProxyResult, "body"> & { body: T },
  stringify = true,
): APIGatewayProxyResult {
  return {
    ...result,
    body: stringify
      ? JSON.stringify(result.body, null, 2)
      : (result.body as any),
  };
}
