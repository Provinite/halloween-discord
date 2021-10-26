/**
 * @module
 * @description Lambda function for executing migrations.
 */
import { closeKnex } from "../common/db/client";
import "pg";
import { runMigrations } from "./lib/runMigrations";
import { createMigrationTable } from "./lib/createMigrationTable";
import { logger } from "../common/Logger";

let stats = {
  total: 0,
  finished: 0,
  madeChanges: false,
};
/**
 *
 * @returns
 */
export const handler: () => Promise<{
  statusCode: number;
  migrationsFinished: number;
  migrationsConsidered: number;
  madeChanges: boolean;
  error?: string;
}> = async () => {
  // make sure stats get reset in case of container reuse
  stats = {
    total: 0,
    finished: 0,
    madeChanges: false,
  };
  logger.info(`Migrations starting, creating migration table if not exists`);
  await createMigrationTable();
  try {
    await runMigrations(stats);
  } catch (err) {
    return {
      statusCode: 500,
      migrationsFinished: stats.finished,
      migrationsConsidered: stats.total,
      madeChanges: stats.madeChanges,
      error: (err as any).message,
    };
  }
  await closeKnex();
  const result = {
    statusCode: 200,
    migrationsFinished: stats.finished,
    migrationsConsidered: stats.total,
    madeChanges: stats.madeChanges,
  };
  logger.info(result);
  return result;
};
