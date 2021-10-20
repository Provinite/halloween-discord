import { PermissionFlagsBits } from "discord-api-types/v9";
import { knex } from "../../../common/db/client";
import { Prize } from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { getClientCredentialsToken } from "../../../common/discord/getClientCredentialsToken";
import {
  commandStructure,
  HalloweenCommand,
} from "../../../common/discord/HalloweenCommand";
import { updateInteractionResponse } from "../../../common/discord/updateInteractionResponse";
import { isKeyOf } from "../../../common/isKeyOf";
import { chatSubcommandHandler } from "../handlers/chatSubcommandHandler";

interface OptionHandler<Field extends keyof Prize> {
  field: Field;
  transform: (s: string) => Prize[Field];
  validate: (s: string) => boolean;
}

function optionHandler<Field extends keyof Prize>(
  optionHandler: OptionHandler<Field>,
) {
  return optionHandler;
}

export const addPrizeSubCommand = chatSubcommandHandler(
  {
    requiredPermissions: PermissionFlagsBits.Administrator,
    subCommandName: commandStructure[HalloweenCommand.Prize].Admin.Add,
  },
  async (subCommand, interaction) => {
    const optionFields = {
      id: optionHandler({
        field: "id",
        transform: (s) => s,
        validate: (s) => /^[a-z][a-z-]{2,25}$/.test(s),
      }),
      name: optionHandler({
        field: "name",
        validate: (s) => /^[a-zA-Z0-9\-() ]+$/.test(s),
        transform: (s) => s,
      }),
      stock: optionHandler({
        field: "initialStock",
        validate: (s) => /^[1-9][0-9][0-9]$/.test(s),
        transform: (s) => Number.parseInt(s, 10),
      }),
      image: optionHandler({
        field: "image",
        validate: () => true,
        transform: (s) => s,
      }),
      weight: optionHandler({
        field: "weight",
        validate: (s) => /^[0-9]+$/.test(s),
        transform: (s) => Number.parseInt(s, 10),
      }),
    } as const;

    const prize: Prize = {
      guildId: interaction.guild_id,
    } as Prize;

    for (const option of subCommand.options) {
      const optionName = option.name;
      if (isKeyOf(optionName, optionFields)) {
        const optionField = optionFields[optionName];
        const value = String(option.value);
        if (optionField.validate(value)) {
          const transformedValue = optionField.transform(value);
          (prize as any)[optionField.field] = transformedValue;
        } else {
          await updateInteractionResponse(
            await getClientCredentialsToken(),
            interaction.token,
            {
              content: `Validation failed for field ${option.name}`,
            },
          );
          return;
        }
      }
    }
    if (!prize.weight) {
      prize.weight = 10;
    }
    prize.currentStock = prize.initialStock;
    await knex(HalloweenTable.Prize).insert(prize);
    await updateInteractionResponse(
      await getClientCredentialsToken(),
      interaction.token,
      {
        content: `Added ${prize.initialStock} units of ${prize.name} as ${prize.id} with weight ${prize.weight}`,
      },
    );
  },
);
