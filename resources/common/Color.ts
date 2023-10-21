import { hexStringToInt } from "./hexStringToInt";

export enum Color {
  Primary = hexStringToInt("EB6123"),
  Error = hexStringToInt("FF0000"),
  Warning = hexStringToInt("FFFF00"),
}
