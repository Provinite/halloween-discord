import { getClientCredentialsToken } from "../../../common/discord/getClientCredentialsToken";
import {
  commandStructure,
  HalloweenCommand,
} from "../../../common/discord/HalloweenCommand";
import { APIEmbed } from "discord-api-types/v9";
import { updateInteractionResponse } from "../../../common/discord/updateInteractionResponse";
import { chatSubcommandHandler } from "../handlers/chatSubcommandHandler";
import { vagueNumberName } from "../../util/vagueNumberName";
import { hexStringToInt } from "../../../common/hexStringToInt";
import { randomElement } from "../../util/randomElement";
import { prizeService } from "../../../common/db/prizeService";

const remainingSynonyms = [
  "remaining",
  "left",
  "to go",
  "eagerly awaiting delivery",
  "left to treat",
  "still to be won",
  "still in the back room",
  "left in the closet",
  "tucked away under the cupboard",
  "left in reserve",
  "waiting for a home",
];

/**
 * Subcommand for listing all prizes.
 * @example
 * list
 */
export const listPrizesSubCommand = chatSubcommandHandler(
  {
    subCommandName: commandStructure[HalloweenCommand.Prize].List,
    requiredPermissions: null,
  },
  async (subCommand, interaction) => {
    const prizes = await prizeService.getPrizes((qb) =>
      qb
        .where({ guildId: interaction.guild_id })
        .andWhere("currentStock", ">", 0),
    );

    // TODO: Handling for > 25 prizes
    // TODO: Probably showing at least some images somehow?
    const prizeEmbeds: APIEmbed[] = [
      {
        author: {
          name: "Luther",
          icon_url:
            "https://cdn.discordapp.com/app-icons/896600597053202462/14e838bbe4426c28377e05558c72ebd8.png?size=512",
        },
        color: hexStringToInt("EB6123"),
        title: "Cloverse Halloween 2021 - Prize List",
        timestamp: new Date().toISOString(),
        description:
          "These are the remaining prizes still to go for the event." +
          " Each prize has a different stock and likelyhood of" +
          " being given out per-win. We intend to give out all of" +
          " the prizes before the event ends!",
        fields: [],
      },
    ];
    const currentEmbed = prizeEmbeds[0];
    for (const prize of prizes) {
      currentEmbed.fields!.push({
        name: prize.name,
        inline: true,
        value: `**${vagueNumberName(prize.currentStock)}** ${randomElement(
          remainingSynonyms,
        )}`,
      });
    }
    await updateInteractionResponse(
      await getClientCredentialsToken(),
      interaction.token,
      {
        embeds: prizeEmbeds,
      },
    );
  },
);
