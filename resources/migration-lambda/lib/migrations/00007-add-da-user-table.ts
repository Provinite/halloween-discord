import { DeviantArtUser, GuildSettings } from "../../../common/db/RecordType";
import { HalloweenTable } from "../../../common/db/TableName";
import { stringButActually } from "../../../common/stringButActually";
import { Migration } from "../Migration";

export const addDeviantArtUserTable: Migration = {
  id: "7-add-da-user-table",
  handler: async (tx) => {
    const colName = stringButActually<keyof DeviantArtUser>();
    await tx.schema.createTable(HalloweenTable.DeviantArtUsers, (table) => {
      table.string(colName("deviantArtName")).notNullable();
      table.string(colName("userId")).notNullable().index();
      table.string(colName("guildId")).notNullable().index();

      table.primary([colName("userId"), colName("guildId")]);

      table
        .foreign(colName("guildId"))
        .references(stringButActually<keyof GuildSettings>("guildId"))
        .inTable(HalloweenTable.GuildSettings);
    });
  },
};
