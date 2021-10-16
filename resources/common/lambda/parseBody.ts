export function parseBody(body: string | null): any {
  try {
    return body ? JSON.parse(body) : undefined;
  } catch (err) {
    return undefined;
  }
}
