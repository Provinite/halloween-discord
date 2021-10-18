/**
 * @module
 * @description This migration creates the Prize table
 * @migration
 */
import { GuildSettings, Prize } from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { stringButActually } from "../../../common/stringButActually";
import { Migration } from "../Migration";

export const createPrizeTableMigration: Migration = {
  id: "create-prize-table",
  handler: async (tx): Promise<void> => {
    const colName = stringButActually<keyof Prize>();
    const guildSettingsColName = stringButActually<keyof GuildSettings>();
    await tx.schema.createTable(HalloweenTable.Prize, (table) => {
      table
        .string(colName("guildId"))
        .notNullable()
        .references(guildSettingsColName("guildId"))
        .inTable(HalloweenTable.GuildSettings);
      table.string(colName("id")).notNullable();
      table.string(colName("name")).notNullable();
      table.integer(colName("initialStock")).notNullable();
      table.integer(colName("currentStock")).notNullable();
      table.integer(colName("weight")).notNullable();
      table.string(colName("image")).notNullable();

      table.primary([colName("guildId"), colName("id")]);
    });
  },
};
