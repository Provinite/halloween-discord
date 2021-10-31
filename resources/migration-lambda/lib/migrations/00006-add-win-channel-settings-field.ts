/**
 * @module
 * @description This migration adds the isPending field to the knock event table
 * @migration
 */
import { GuildSettings } from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { stringButActually } from "../../../common/stringButActually";
import { Migration } from "../Migration";

export const addWinChannelSettingsFieldMigration: Migration = {
  id: "6-add-win-channel-settings-field",
  handler: async (tx) => {
    const colName = stringButActually<keyof GuildSettings>("winChannel");
    await tx.schema.alterTable(HalloweenTable.GuildSettings, (table) => {
      table.string(colName).nullable().defaultTo(null);
    });
  },
};
