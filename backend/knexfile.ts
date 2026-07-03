import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const migrationsDirectory = path.resolve(__dirname, '..', 'database', 'migrations');
const seedsDirectory = path.resolve(__dirname, '..', 'database', 'seeds');

interface KnexConfig {
  [key: string]: Knex.Config;
}

const config: KnexConfig = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fleet_dashboard',
    migrations: {
      directory: migrationsDirectory,
      extension: 'ts',
    },
    seeds: {
      directory: seedsDirectory,
      extension: 'ts',
    },
    pool: {
      min: 2,
      max: 10,
    },
    acquireConnectionTimeout: 60000,
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    migrations: {
      directory: migrationsDirectory,
      extension: 'ts',
    },
    seeds: {
      directory: seedsDirectory,
      extension: 'ts',
    },
    pool: {
      min: 2,
      max: 20,
    },
    acquireConnectionTimeout: 60000,
  },

  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL_TEST || 'postgresql://postgres:postgres@localhost:5432/fleet_dashboard_test',
    migrations: {
      directory: migrationsDirectory,
      extension: 'ts',
    },
    seeds: {
      directory: seedsDirectory,
      extension: 'ts',
    },
    pool: {
      min: 1,
      max: 5,
    },
    acquireConnectionTimeout: 60000,
  },
};

export default config;
