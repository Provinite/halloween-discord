/**
 * @module
 * @description This migration adds the winRate field to the guild settings table
 * @migration
 */
import { GuildSettings } from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { stringButActually } from "../../../common/stringButActually";
import { Migration } from "../Migration";

export const addWinRateMigration: Migration = {
  id: "3-add-guild-settings-winrate-field",
  handler: async (tx) => {
    const colName = stringButActually<keyof GuildSettings>("winRate");
    await tx.schema.alterTable(HalloweenTable.GuildSettings, (table) => {
      table.float(colName).notNullable().defaultTo(0.5);
    });
  },
};
