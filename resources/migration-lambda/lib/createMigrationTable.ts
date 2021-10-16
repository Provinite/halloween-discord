import { knex } from "../../common/db/client";
import { Migration } from "../../common/db/RecordType";
import { HalloweenTable } from "../../common/db/TableName";
import { stringButActually } from "../../common/stringAs";

/**
 * Create the migration tracking table if it doesn't exist.
 */
export async function createMigrationTable(): Promise<void> {
  const colName = stringButActually<keyof Migration>();
  if (await knex().schema.hasTable(HalloweenTable.Migrations)) {
    return;
  }
  await knex().schema.createTable(HalloweenTable.Migrations, (table) => {
    table.string(colName("id")).notNullable().primary();
    table.datetime(colName("ranAt")).notNullable().defaultTo(knex().fn.now());
  });
}
