import { decode } from "./Base64";

export function base64ToUint8Array(base64Str: string): Uint8Array {
  const binaryString = decode(base64Str);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
