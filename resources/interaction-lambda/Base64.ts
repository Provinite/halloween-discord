export function encode(str: string): string {
  return Buffer.from(str, "binary").toString("base64");
}
export function decode(str: string): string {
  return Buffer.from(str, "base64").toString("binary");
}
