export function encode(str: string): string {
  return Buffer.from(str, "binary").toString("hex");
}
export function decode(str: string): string {
  return Buffer.from(str, "hex").toString("binary");
}
