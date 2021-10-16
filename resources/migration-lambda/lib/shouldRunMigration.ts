import { knex } from "../../common/db/client";
import { HalloweenTable } from "../../common/db/TableName";
import { Migration } from "./Migration";

/**
 * Run a migration. Creates a new transaction, rolls back on error.
 * @param migration The migration to run
 */
export async function shouldRunMigration(
  migration: Migration,
): Promise<boolean> {
  const record = await knex(HalloweenTable.Migrations)
    .count<{ count: string }[]>("id", { as: "count" })
    .where({ id: migration.id });
  return Number.parseInt(record[0].count, 10) === 0;
}
