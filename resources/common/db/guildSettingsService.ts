import { Moment } from "moment";
import * as moment from "moment";
import { MissingGuildSettingsError } from "../errors/MissingGuildConfigurationError";
import { knex } from "./client";
import { GuildSettings } from "./RecordType";
import { HalloweenTable } from "./TableName";

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
    const todaysReset = moment.tz("America/Chicago").hour(resetTime);
    if (resetTime > currentHour) {
      // haven't yet reset today, last reset was yesterday
      return todaysReset.subtract(1, "day");
    } else {
      // last reset was today
      return todaysReset;
    }
  },
} as const;
