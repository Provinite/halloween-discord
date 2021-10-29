import { randomInt } from "crypto";

/**
 * Rnadomly select an element from an array with weights. For example, an element with weight of 2 will be twice as likely to be selected as an element with weight of 1.
 * @param elements An array of elements to choose from.
 * @param weights An array of weights, one for each element. Weights must be integers greater than 1
 */
export function selectRandomWeightedElement<T>(
  elements: T[],
  weights: number[],
): T {
  if (elements.length !== weights.length) {
    throw new Error("elements and weights must be the same length");
  }

  // sum the weights to determine the range of our selection
  const totalWeight = weights.reduce((acc, curr) => acc + curr, 0);

  const randomNumber = randomInt(totalWeight);
  let sum = 0;
  for (let i = 0; i < elements.length; i++) {
    sum += weights[i];
    if (sum > randomNumber) {
      return elements[i];
    }
  }
  return elements[elements.length - 1];
}
