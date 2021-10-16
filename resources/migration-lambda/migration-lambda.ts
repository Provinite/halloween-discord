import { closeKnex } from "../common/db/client";
import "pg";
import { runMigrations } from "./lib/runMigrations";
import { createMigrationTable } from "./lib/createMigrationTable";

let stats = {
  total: 0,
  finished: 0,
  madeChanges: false,
};
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
  console.log(`Migrations starting, creating migration table if not exists`);
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
  console.log(JSON.stringify(result, null, 2));
  return result;
};
