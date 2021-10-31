/**
 * @module
 * @description This migration adds the isPending field to the knock event table
 * @migration
 */
import { KnockEvent } from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { stringButActually } from "../../../common/stringButActually";
import { Migration } from "../Migration";

export const addIsPendingFieldMigration: Migration = {
  id: "4-add-knock-is-pending-field",
  handler: async (tx) => {
    const colName = stringButActually<keyof KnockEvent>("isPending");
    await tx.schema.alterTable(HalloweenTable.KnockEvent, (table) => {
      table.boolean(colName).notNullable().defaultTo(false);
    });
  },
};
