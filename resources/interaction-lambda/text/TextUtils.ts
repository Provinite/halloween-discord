import * as Base64 from "./Base64";
import * as Hex from "./Hex";

export function base64ToUint8Array(base64Str: string): Uint8Array {
  return binaryStringToUint8Array(Base64.decode(base64Str));
}

export function hexToUint8Array(hexStr: string): Uint8Array {
  return binaryStringToUint8Array(Hex.decode(hexStr));
}

export function binaryStringToUint8Array(binaryStr: string): Uint8Array {
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}
