import { knex } from "../client";
import { guildSettingsService } from "../guildSettingsService";
import { GuildSettings } from "../RecordType";

export function createDefaultGuildSettings(
  guildId: string,
  tx = knex(),
): Promise<GuildSettings> {
  return guildSettingsService.saveGuildSettings(
    {
      guildId,
      endDate: null,
      knocksPerDay: 2,
      resetTime: 6,
      startDate: null,
      winRate: 0.5,
    },
    tx,
  );
}
