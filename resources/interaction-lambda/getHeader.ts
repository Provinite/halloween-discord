import { APIGatewayProxyEventHeaders } from "aws-lambda";

export function getHeader(
  headers: APIGatewayProxyEventHeaders,
  header: string,
): string | null {
  const result = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === header.toLowerCase(),
  );
  if (!result) {
    return null;
  }
  return result[1] || null;
}
