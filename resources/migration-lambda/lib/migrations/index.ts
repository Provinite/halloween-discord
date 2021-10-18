import { Migration } from "../Migration";
import { createGuildSettingsMigration } from "./00000-create-guild-settings-table";
import { createPrizeTableMigration } from "./00001-create-prize-table";
import { createKnockEventTableMigration } from "./00002-create-knock-event-table";

const migrations: Migration[] = [
  createGuildSettingsMigration,
  createPrizeTableMigration,
  createKnockEventTableMigration,
];

const migrationsById: Record<string, Migration> = {};

for (const migration of migrations) {
  if (migrationsById[migration.id.toLowerCase()]) {
    throw new Error(`Duplicate migration id ${migration.id}`);
  }
  migrationsById[migration.id.toLowerCase()] = migration;
}

export default migrations;