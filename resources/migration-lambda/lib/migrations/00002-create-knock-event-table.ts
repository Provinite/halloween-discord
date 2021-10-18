/**
 * @module
 * @description
 * This migration creates the knock event table.
 * @migration
 */
import { KnockEvent, Prize } from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { stringButActually } from "../../../common/stringButActually";
import { Migration } from "../Migration";

export const createKnockEventTableMigration: Migration = {
  id: "create-knock-event-table",
  handler: async (tx): Promise<void> => {
    const colName = stringButActually<keyof KnockEvent>();
    const prizeColName = stringButActually<keyof Prize>();

    await tx.schema.createTable(HalloweenTable.KnockEvent, (table) => {
      table.increments(colName("id"), { primaryKey: true });
      table.string(colName("guildId")).notNullable();
      table.string(colName("prizeId")).nullable().defaultTo(null);
      table.dateTime(colName("time")).notNullable().defaultTo(tx.fn.now());
      table.string(colName("userId")).notNullable().index();
      table
        .foreign([colName("guildId"), colName("prizeId")])
        .references([prizeColName("guildId"), prizeColName("id")])
        .inTable(HalloweenTable.Prize);
    });
  },
};
