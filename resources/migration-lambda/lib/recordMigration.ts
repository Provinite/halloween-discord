import { Knex } from "knex";
import { HalloweenTable } from "../../common/db/TableName";
import { Migration } from "./Migration";
import { Migration as MigrationRecord } from "../../common/db/RecordType";
export function recordMigration(
  migration: Migration,
  tx: Knex.Transaction,
): Promise<void> {
  return tx<MigrationRecord>(HalloweenTable.Migrations).insert({
    id: migration.id,
    ranAt: new Date(),
  });
}
