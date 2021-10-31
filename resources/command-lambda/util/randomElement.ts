/**
 * Selects a random element from an array.
 * @param arr The array to select from.
 * @returns The selected element.
 */
export function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
