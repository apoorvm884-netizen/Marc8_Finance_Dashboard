import knex, { Knex } from 'knex';
import { env } from './env';

let db: Knex;

export function getDatabase(): Knex {
  if (!db) {
    const config: Knex.Config = {
      client: 'pg',
      connection: env.DATABASE_URL,
      pool: {
        min: 2,
        max: env.NODE_ENV === 'production' ? 20 : 10,
      },
      acquireConnectionTimeout: 60000,
      migrations: {
        tableName: 'knex_migrations',
      },
    };

    if (env.NODE_ENV === 'production') {
      config.connection = {
        connectionString: env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      };
    }

    db = knex(config);
  }

  return db;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const database = getDatabase();
    await database.raw('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (db) {
    await db.destroy();
  }
}
