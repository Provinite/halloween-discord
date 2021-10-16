import { knex } from "../../common/db/client";
import { Migration } from "./Migration";
import { Knex } from "knex";
import { recordMigration } from "./recordMigration";
/**
 * Run a single migration inside a transaction.
 * @param migration
 */
export async function runMigration(
  migration: Migration,
  tx?: Knex.Transaction,
): Promise<void> {
  if (tx) {
    await migration.handler(tx);
    await recordMigration(migration, tx);
  } else {
    await knex().transaction(async (tx) => runMigration(migration, tx));
  }
}
