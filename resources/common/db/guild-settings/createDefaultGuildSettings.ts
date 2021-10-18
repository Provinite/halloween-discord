import { Knex } from "knex";
import { knex } from "../client";
import { GuildSettings } from "../RecordType";
import { HalloweenTable } from "../TableName";

export function createDefaultGuildSettings(
  guildId: string,
  knx = knex(),
): Knex.QueryBuilder<GuildSettings> {
  return knx<GuildSettings>(HalloweenTable.GuildSettings).insert({
    guildId,
    endDate: null,
    knocksPerDay: 2,
    resetTime: 6,
    startDate: null,
  });
}
