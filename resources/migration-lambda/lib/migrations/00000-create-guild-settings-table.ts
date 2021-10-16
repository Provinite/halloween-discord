/**
 * @module
 * @description This migration creates the guild settings table
 * @migration
 */
import { GuildSettings } from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { stringButActually } from "../../../common/stringAs";
import { Migration } from "../Migration";

export const createGuildSettingsMigration: Migration = {
  id: "create-guild-settings-table",
  handler: async (tx) => {
    const colName = stringButActually<keyof GuildSettings>();
    await tx.schema.createTable(HalloweenTable.GuildSettings, (table) => {
      table.string(colName("guildId")).notNullable().primary();
      table.integer(colName("resetTime")).notNullable().defaultTo(12);
      table.integer(colName("knocksPerDay")).notNullable().defaultTo(2);
      table
        .datetime(colName("startDate"), { useTz: true })
        .nullable()
        .defaultTo(null);
      table
        .datetime(colName("endDate"), { useTz: true })
        .nullable()
        .defaultTo(null);
    });
  },
};
