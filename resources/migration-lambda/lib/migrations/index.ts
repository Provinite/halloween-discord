import { Migration } from "../Migration";
import { createGuildSettingsMigration } from "./00000-create-guild-settings-table";
import { createPrizeTableMigration } from "./00001-create-prize-table";
import { createKnockEventTableMigration } from "./00002-create-knock-event-table";
import { addWinRateMigration } from "./00003-add-winrate-field";
import { addIsPendingFieldMigration } from "./00004-add-knock-is-pending-field";
import { createGiftyTableMigration } from "./00005-create-gifty-table";
import { addWinChannelSettingsFieldMigration } from "./00006-add-win-channel-settings-field";

const migrations: Migration[] = [
  createGuildSettingsMigration,
  createPrizeTableMigration,
  createKnockEventTableMigration,
  addWinRateMigration,
  addIsPendingFieldMigration,
  createGiftyTableMigration,
  addWinChannelSettingsFieldMigration,
];

const migrationsById: Record<string, Migration> = {};

for (const migration of migrations) {
  if (migrationsById[migration.id.toLowerCase()]) {
    throw new Error(`Duplicate migration id ${migration.id}`);
  }
  migrationsById[migration.id.toLowerCase()] = migration;
}

export default migrations;
