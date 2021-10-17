import { sign } from "tweetnacl";
import { envService } from "../../common/envService";

export function verifyDiscordInteraction(
  timestamp: string | null,
  body: string,
  signature: string | null,
): boolean {
  if (!timestamp || !signature) {
    return false;
  }
  try {
    return sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, "hex"),
      envService.getDiscordPublicKey(),
    );
  } catch (err) {
    return false;
  }
}
