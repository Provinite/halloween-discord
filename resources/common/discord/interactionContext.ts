import { AsyncLocalStorage } from "async_hooks";
import { APIInteraction } from "discord-api-types";
export const interactionContext = new AsyncLocalStorage<APIInteraction>();
export function getInteractionContextOrDie(): APIInteraction {
  const result = interactionContext.getStore();
  if (!result) {
    throw new Error("No interaction context found");
  }
  return result;
}
