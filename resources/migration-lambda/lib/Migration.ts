import { Knex } from "knex";

/**
 * A runnable migration
 */
export interface Migration {
  id: string;
  handler: (tx: Knex.Transaction) => Promise<void>;
}
