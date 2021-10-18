import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { chatCommandHandler } from "./handlers/chatCommandHandler";

export const prizeCommand = chatCommandHandler(
  HalloweenCommand.Prize,
  async (_interaction) => {
    //
  },
);
