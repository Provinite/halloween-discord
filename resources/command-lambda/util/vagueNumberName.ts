/**
 * Returns a vague name for a number.
 * @param n  The number to name.
 * @returns A vague name for the number like "a few" or "an armload" or "bundles".
 */
export function vagueNumberName(n: number): string {
  for (const key of (
    Object.keys(ranges) as unknown as Array<keyof typeof ranges>
  ).sort()) {
    const maxValue = Number(key);
    if (n <= maxValue) {
      const options = ranges[key];
      return options[Math.floor(Math.random() * options.length)];
    }
  }
  return "an absolutely huge number";
}

/**
 * Ranges for number names. For the nth key `k_n`, the value is an array of
 * names for numbers in the range `(k_(n-1), k_n]`.
 * Only applicable to numbers >= 0
 */
const ranges = {
  1: ["just one"],
  5: ["a few", "several", "a couple", "not too many"],
  10: ["a bunch", "a bundle", "an armload", "many"],
  20: ["bunches", "gobs", "oodles", "bundles", "heaps"],
  999999: [
    "tons",
    "too many to count",
    "an absolute blanket fortload",
    "a truckload",
  ],
} as const;
