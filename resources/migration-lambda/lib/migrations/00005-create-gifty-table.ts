/**
 * @module
 * @description This migration creates the Gifty table
 * @migration
 */
import {
  Gifty,
  GuildSettings,
  KnockEvent,
} from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { stringButActually } from "../../../common/stringButActually";
import { Migration } from "../Migration";

export const createGiftyTableMigration: Migration = {
  id: "create-gifty-table",
  handler: async (tx): Promise<void> => {
    const colName = stringButActually<keyof Gifty>();
    const knockEventColName = stringButActually<keyof KnockEvent>();
    const guildSettingsColName = stringButActually<keyof GuildSettings>();
    await tx.schema.createTable(HalloweenTable.Gifty, (table) => {
      table.increments(colName("id"), { primaryKey: true });
      table.string(colName("guildId")).notNullable();
      table.dateTime(colName("time")).notNullable().defaultTo(tx.fn.now());
      table.string(colName("fromUserId")).notNullable();
      table.string(colName("toUserId")).notNullable();
      table.integer(colName("knockEventId")).nullable();

      table
        .foreign(colName("knockEventId"))
        .references(knockEventColName("id"))
        .inTable(HalloweenTable.KnockEvent);

      table
        .foreign(colName("guildId"))
        .references(guildSettingsColName("guildId"))
        .inTable(HalloweenTable.GuildSettings);
    });
  },
};
