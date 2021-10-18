import {
  APIChatInputApplicationCommandGuildInteraction,
  ApplicationCommandInteractionDataOptionSubCommand,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from "discord-api-types/v9";
import { knex } from "../../../common/db/client";
import { createDefaultGuildSettings } from "../../../common/db/guild-settings/createDefaultGuildSettings";
import { hasGuildSettings } from "../../../common/db/guild-settings/hasGuildSettings";
import { GuildSettings } from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { getClientCredentialsToken } from "../../../common/discord/getClientCredentialsToken";
import {
  commandStructure,
  HalloweenCommand,
} from "../../../common/discord/HalloweenCommand";
import { updateInteractionResponse } from "../../../common/discord/updateInteractionResponse";
import { isKeyOf } from "../../../common/isKeyOf";

export const setSettingsSubCommand = async (
  subCommand: ApplicationCommandInteractionDataOptionSubCommand,
  interaction: APIChatInputApplicationCommandGuildInteraction,
): Promise<void> => {
  if (subCommand.name !== commandStructure[HalloweenCommand.Settings].Set) {
    // TODO: Error handling
    return;
  }

  const permissions = BigInt(interaction.member.permissions);
  if (!(permissions & PermissionFlagsBits.Administrator)) {
    await updateInteractionResponse(
      await getClientCredentialsToken(),
      interaction.token,
      {
        content: "No.",
      },
    );
    return;
  }
  // TODO: Move to constants somewhere
  const fieldOption = subCommand.options.find((o) => o.name === "setting");
  const valueOption = subCommand.options.find((o) => o.name === "value");

  if (
    !fieldOption ||
    !valueOption ||
    fieldOption.type !== ApplicationCommandOptionType.String ||
    valueOption.type !== ApplicationCommandOptionType.String
  ) {
    // TODO: Error handling
    return;
  }

  interface Field<K extends keyof GuildSettings> {
    field: K;
    validate: (s: string) => boolean;
    transform: (s: string) => GuildSettings[K];
  }

  function field<K extends keyof GuildSettings>(field: Field<K>): Field<K> {
    return field;
  }

  // TODO: These fields are used in the command definitions also
  // should be constants somewhere
  const fieldMap = {
    knocks_per_day: field({
      field: "knocksPerDay",
      // 1-19
      validate: (s) => /^1[0-9]?$/.test(s),
      transform: (s) => Number.parseInt(s, 10),
    }),
    start_date: field({
      field: "startDate",
      // YYYY-MM-DD
      validate: (s) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s),
      transform: (s) => new Date(`${s} 00:00:00Z-5`),
    }),
    end_date: field({
      field: "endDate",
      // YYYY-MM-DD
      validate: (s) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s),
      transform: (s) => new Date(`${s} 00:00:00Z-5`),
    }),
    reset_time: field({
      field: "resetTime",
      // 0-23
      validate: (s) => /^([0-9]|1[0-9]|2[0-3])$/.test(s),
      transform: (s) => Number.parseInt(s, 10),
    }),
  } as const;

  const selectedField = fieldOption.value;
  if (!isKeyOf(selectedField, fieldMap)) {
    // TODO: Error handling
    return;
  }

  const updateField = fieldMap[selectedField];

  // Validate incoming data for the specific field
  if (!updateField.validate(valueOption.value)) {
    await updateInteractionResponse(
      await getClientCredentialsToken(),
      interaction.token,
      {
        content:
          "That value doesn't look quite right. Please double check the format. Dates should be in the YYYY-MM-DD format. Reset time should be in a 24-hour format, 12 = noon. All times are US Central",
      },
    );
    return;
  }

  await knex().transaction(async (tx) => {
    if (!(await hasGuildSettings(interaction.guild_id, tx))) {
      await createDefaultGuildSettings(interaction.guild_id, tx);
    }
    await tx<GuildSettings>(HalloweenTable.GuildSettings).update({
      [updateField.field]: updateField.transform(valueOption.value),
    });
    await updateInteractionResponse(
      await getClientCredentialsToken(),
      interaction.token,
      {
        content: `Got it. Updated ${selectedField}`,
      },
    );
  });
};
