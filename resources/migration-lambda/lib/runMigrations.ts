import { logger } from "../../common/Logger";
import migrations from "./migrations";
import { runMigration } from "./runMigration";
import { shouldRunMigration } from "./shouldRunMigration";

/**
 * Run all pending migrations.
 * @param stats - Optional stats object, will be updated with the results
 * of the run. Useful for reporting status, and will still be accurate after
 * an error/rollback.
 */
export async function runMigrations(
  stats: MigrationStats = {
    madeChanges: false,
    finished: 0,
    total: 0,
  },
): Promise<void> {
  let migrationCount = 1;
  stats.total = migrations.length;

  logger.info(`Starting migrations. [${stats.total}]`);

  for (const migration of migrations) {
    const logPrefix = `[${migrationCount}/${migrations.length}:${migration.id}]: `;
    const log = (msg: string) => logger.info(`${logPrefix}${msg}`);

    if (await shouldRunMigration(migration)) {
      log(`Running migration`);
      try {
        await runMigration(migration);
        stats.madeChanges = true;
        stats.finished++;
      } catch (err) {
        logger.error(`${logPrefix}Error processing migration`);
        if (err && (err as any).stack) {
          const error = err as Error;
          logger.error(error.name);
          logger.error(error.message);
          logger.error(error.stack);
        } else {
          logger.error(err);
        }
        throw err;
      }

      log(`Finished`);
    } else {
      log(`Already run`);
    }
    migrationCount++;
  }
}

export interface MigrationStats {
  total: number;
  finished: number;
  madeChanges: boolean;
}
