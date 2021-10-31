import { randomInt } from "crypto";
import { envService } from "./envService";

/**
 * This is lazy, but fine for now. If the images change, we need to update this. In the future, we can use the manifest to get an image url.
 */
export const NUM_CANDIES = 130;

export function getCandyImageUrl(): string {
  return (
    envService.getImageBucketUrl() + "candy/" + randomInt(NUM_CANDIES) + ".png"
  );
}
