import { Moment } from "moment";
import moment = require("moment");
import { MissingGuildSettingsError } from "../errors/MissingGuildConfigurationError";
import { knex } from "./client";
import { GuildSettings } from "./RecordType";
import { HalloweenTable } from "./TableName";
import { ValidationError } from "../errors/ValidationError";

export enum EventStatus {
  NotStartedYet,
  Ongoing,
  Ended,
}

export const guildSettingsService = {
  /**
   * Get guild settings for the specified guild ID
   * @param guildId
   */
  getGuildSettings: async (
    guildId: string,
    tx = knex(),
  ): Promise<GuildSettings> => {
    const guildSettings = await tx<GuildSettings>(HalloweenTable.GuildSettings)
      .select("*")
      .where({ guildId })
      .first();
    if (!guildSettings) {
      throw new MissingGuildSettingsError({
        sourceError: new Error(
          `No settings found for ${guildId} while attempting to get guild settings`,
        ),
        thrownFrom: "guildSettingsService.getGuildSettings",
        guildId,
      });
    }
    return guildSettings;
  },
  getLastReset({ resetTime }: GuildSettings): Moment {
    const currentHour = moment.tz("America/Chicago").hour();
    const todaysReset = moment
      .tz("America/Chicago")
      .hour(resetTime)
      .startOf("hour");
    if (resetTime > currentHour) {
      // haven't yet reset today, last reset was yesterday
      return todaysReset.subtract(1, "day");
    } else {
      // last reset was today
      return todaysReset;
    }
  },
  async updateGuildSettings(
    guildId: string,
    settings: Partial<GuildSettings>,
    tx = knex(),
  ) {
    const guildSettings = await this.getGuildSettings(guildId, tx);
    const updatedSettings = { ...guildSettings, ...settings };
    const validationResult = this.validateGuildSettings(updatedSettings);
    if (validationResult === true) {
      await tx(HalloweenTable.GuildSettings).update(updatedSettings).where({
        guildId,
      });
    } else {
      throw new ValidationError({
        sourceError: new Error(
          `Invalid settings provided while attempting to update guild settings`,
        ),
        thrownFrom: "guildSettingsService.updateGuildSettings",
        validationErrors: validationResult,
        message: `Guild Settings validatiion failed during update`,
      });
    }
  },
  async saveGuildSettings(
    guildSettings: GuildSettings,
    tx = knex(),
  ): Promise<GuildSettings> {
    const validationResult = this.validateGuildSettings(guildSettings);
    if (validationResult === true) {
      await tx(HalloweenTable.GuildSettings).insert(guildSettings);
      return guildSettings;
    } else {
      throw new ValidationError({
        message: "Prize validation failed",
        validationErrors: validationResult,
        thrownFrom: "prizeService.savePrize",
        sourceError: new Error(
          `Guild Settings validation failed when saving for guild with id ${guildSettings.guildId}`,
        ),
      });
    }
  },
  validateGuildSettings(
    guildSettings: GuildSettings,
  ): true | Array<{ field: keyof GuildSettings | "*"; error: string }> {
    const { startDate, endDate, guildId, knocksPerDay, resetTime, winRate } =
      guildSettings;
    const rules: Array<[keyof GuildSettings | "*", string, () => boolean]> = [
      [
        "startDate",
        "Start date must be before end date if they are both set",
        () => {
          if (!startDate || !endDate) {
            return true;
          } else {
            return startDate < endDate;
          }
        },
      ],
      [
        "guildId",
        "Guild ID should be a numeric string",
        () => /^\d+$/.test(guildId),
      ],
      [
        "knocksPerDay",
        "Knocks per day should be a positive whole number",
        () =>
          typeof knocksPerDay === "number" &&
          knocksPerDay > 0 &&
          Number.isInteger(knocksPerDay) &&
          Number.isSafeInteger(knocksPerDay),
      ],
      [
        "resetTime",
        "Reset time must be a whole number between 0 and 23",
        () => typeof resetTime === "number" && resetTime >= 0 && resetTime < 24,
      ],
      [
        "winRate",
        "Win rate must be a decimal between 0 and 1",
        () => typeof winRate === "number" && winRate >= 0 && winRate <= 1,
      ],
    ];

    const failingRules = rules.filter(([, , rule]) => !rule());
    if (!failingRules.length) {
      return true;
    } else {
      return failingRules.map(([field, error]) => ({
        field,
        error,
      }));
    }
  },
  getEventStatus(guildSettings: GuildSettings): EventStatus {
    const { startDate, endDate } = guildSettings;
    if (!startDate) {
      return EventStatus.NotStartedYet;
    }
    const now = moment.tz("America/Chicago");
    if (now.isBefore(startDate)) {
      return EventStatus.NotStartedYet;
    } else if (endDate && now.isAfter(endDate)) {
      return EventStatus.Ended;
    } else {
      return EventStatus.Ongoing;
    }
  },
} as const;
