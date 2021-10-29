import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from "discord-api-types/v9";
import { knex } from "../../../common/db/client";
import { createDefaultGuildSettings } from "../../../common/db/guild-settings/createDefaultGuildSettings";
import { hasGuildSettings } from "../../../common/db/guild-settings/hasGuildSettings";
import { GuildSettings } from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { discordService } from "../../../common/discord/discordService";
import {
  commandStructure,
  HalloweenCommand,
} from "../../../common/discord/HalloweenCommand";
import { ValidationError } from "../../../common/errors/ValidationError";
import { isKeyOf } from "../../../common/isKeyOf";
import { HalloweenDiscordError } from "../../errors/HalloweenDiscordError";
import { chatSubcommandHandler } from "../handlers/chatSubcommandHandler";

/**
 * Admin-only command for configuring event settings.
 */
export const setSettingsSubCommand = chatSubcommandHandler(
  {
    subCommandName: commandStructure[HalloweenCommand.Settings].Set,
    requiredPermissions: PermissionFlagsBits.Administrator,
  },
  async (subCommand, interaction): Promise<void> => {
    // TODO: Move to constants somewhere
    const fieldOption = subCommand.options.find((o) => o.name === "setting");
    const valueOption = subCommand.options.find((o) => o.name === "value");

    if (
      !fieldOption ||
      !valueOption ||
      fieldOption.type !== ApplicationCommandOptionType.String ||
      valueOption.type !== ApplicationCommandOptionType.String
    ) {
      throw new HalloweenDiscordError({
        thrownFrom: "setSettingsSubCommand",
        message:
          "Invalid subcommand options. Missing setting or value string options",
        sourceError: new Error(
          "Invalid subcommand options, 'setting' and 'value' not both found or not both string options",
        ),
      });
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
      win_rate: field({
        field: "winRate",
        // a float
        validate: (s) => /^[0-9]*(\.[0-9]+)?$/.test(s),
        transform: (s) => Number.parseFloat(s),
      }),
    } as const;

    const selectedField = fieldOption.value;
    if (!isKeyOf(selectedField, fieldMap)) {
      throw new ValidationError({
        thrownFrom: "setSettingsSubCommand",
        message: `Invalid field: "${selectedField}"`,
        sourceError: new Error(`Unknown setting: ${selectedField}`),
        validationErrors: [{ field: "setting", error: `Unknown setting` }],
      });
    }

    const updateField = fieldMap[selectedField];

    // Validate incoming data for the specific field
    if (!updateField.validate(valueOption.value)) {
      await discordService.updateInteractionResponse(interaction, {
        content:
          "That value doesn't look quite right. Please double check the format. Dates should be in the YYYY-MM-DD format. Reset time should be in a 24-hour format, 12 = noon. All times are US Central",
      });
      return;
    }

    await knex().transaction(async (tx) => {
      if (!(await hasGuildSettings(interaction.guild_id, tx))) {
        await createDefaultGuildSettings(interaction.guild_id, tx);
      }
      await tx<GuildSettings>(HalloweenTable.GuildSettings).update({
        [updateField.field]: updateField.transform(valueOption.value),
      });
      await discordService.updateInteractionResponse(interaction, {
        content: `Got it. Updated ${selectedField}`,
      });
    });
  },
);
