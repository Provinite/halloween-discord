import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { Color } from "../../common/Color";
import { deviantArtUserService } from "../../common/db/deviantArtUserService";
import { discordService } from "../../common/discord/discordService";
import { HalloweenCommand } from "../../common/discord/HalloweenCommand";
import { getDiscordEmbedAuthor } from "../../common/discord/ui/getDiscordEmbedAuthor";
import { getDiscordEmbedTimestamp } from "../../common/discord/ui/getDiscordEmbedTimestamp";
import { HalloweenDiscordError } from "../errors/HalloweenDiscordError";
import { chatCommandHandler } from "./handlers/chatCommandHandler";

export const deviantArtCommand = chatCommandHandler(
  HalloweenCommand.DeviantArt,
  async (interaction) => {
    const { options } = interaction.data;
    if (!options || !options.length) {
      throw new HalloweenDiscordError({
        thrownFrom: "deviantArtCommand",
        message:
          "You must provide your deviant art username as an option to this command",
        interaction,
        sourceError: new Error(
          `No interaction options provided for command ${HalloweenCommand.DeviantArt}`,
        ),
      });
    }
    const [option] = options;
    if (option.type !== ApplicationCommandOptionType.String) {
      throw new HalloweenDiscordError({
        thrownFrom: "deviantArtCommand",
        message:
          "Invalid option type for DeviantArt username. Expected a string",
        interaction,
        sourceError: new Error(
          `Got a non-string option in the first slot for command ${HalloweenCommand.DeviantArt}`,
        ),
      });
    }

    const { value: deviantArtName } = option;
    if (!deviantArtName || typeof deviantArtName !== "string") {
      throw new HalloweenDiscordError({
        thrownFrom: "deviantArtCommand",
        message: "Invalid DeviantArt name provided. Must not be empty.",
        interaction,
        sourceError: new Error(
          `Got an empty value for the option in the first slot for command ${HalloweenCommand.DeviantArt}`,
        ),
      });
    }

    const {
      guild_id: guildId,
      member: {
        user: { id: userId },
      },
    } = interaction;

    await deviantArtUserService.saveDeviantArtUser({
      deviantArtName,
      guildId,
      userId,
    });

    await discordService.updateInteractionResponse(interaction, {
      embeds: [
        {
          author: getDiscordEmbedAuthor(),
          timestamp: getDiscordEmbedTimestamp(),
          color: Color.Primary,
          title: `Cloverse Halloween 2023 - Setting`,
          description: `Your DeviantArt name has been saved! You can use the _/${HalloweenCommand.DeviantArt}_ command again at any time to update it.`,
          fields: [{ name: "DeviantArt Username", value: deviantArtName }],
        },
      ],
    });
  },
);
