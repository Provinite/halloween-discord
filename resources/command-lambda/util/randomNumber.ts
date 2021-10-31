import { randomInt } from "crypto";
/**
 * Max value to be used with crypto.randomInt.
 *
 * @note
 * randomInt specifies max - min must be less than 2^48, and both must be safe integers
 **/
const MAX = Math.min(Math.pow(2, 48) - 1, Number.MAX_SAFE_INTEGER);
/**
 * Get a cryptographically secure random number in [0, 1)
 * @returns
 */
export function randomFloat(): number {
  return randomInt(0, MAX) / MAX;
}
