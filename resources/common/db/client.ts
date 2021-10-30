import { knex as createKnex, Knex } from "knex";
import { RecordType } from "./RecordType";
import { HalloweenTable } from "./TableName";
import pgDialect from "knex/lib/dialects/postgres";
import { capturePostgres } from "aws-xray-sdk";
import pg = require("pg");
capturePostgres(pg);
let knexInstance: Knex;

type TypedKnex<T> = T &
  (<R extends HalloweenTable>(table: R) => Knex.QueryBuilder<RecordType<R>>);

export function knex(): TypedKnex<Knex>;
export function knex<T extends HalloweenTable>(
  tableName: T,
  instance?: Knex,
): Knex.QueryBuilder<RecordType<T>, RecordType<T>[]>;
export function knex<T extends HalloweenTable>(
  tableName?: T,
  instance?: Knex,
): Knex.QueryBuilder<RecordType<T>> | Knex {
  if (!knexInstance && !instance) {
    const dbConnectionInfo: {
      password: string;
      port: number;
      host: string;
      username: string;
    } = JSON.parse(process.env.DB_SECRET_JSON || "{}");
    const dbName = process.env.DB_NAME || "postgres";

    knexInstance = createKnex({
      client: pgDialect,
      connection: {
        host: dbConnectionInfo.host,
        password: dbConnectionInfo.password,
        user: dbConnectionInfo.username,
        database: dbName,
        pool: {
          min: 0,
          max: 1,
        },
      },
      searchPath: ["public"],
    });
  }
  if (!instance) {
    instance = knexInstance;
  }
  if (!tableName) {
    return instance;
  }
  return instance<RecordType<T>>(tableName);
}

export async function closeKnex(): Promise<void> {
  if (knexInstance) {
    await knexInstance.destroy();
    knexInstance = undefined as any;
  }
}
