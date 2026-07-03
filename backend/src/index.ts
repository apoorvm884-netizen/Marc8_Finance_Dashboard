import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { checkDatabaseConnection, closeDatabaseConnection, getDatabase } from './config/database';
import { errorHandler } from './middleware/error-handler';
import { apiRateLimiter } from './middleware/rate-limiter';
import routes from './routes';
import { logger } from './utils/logger';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use('/api/v1', apiRateLimiter, routes);

app.use(errorHandler);

async function runMigrations(): Promise<void> {
  try {
    const db = getDatabase();
    await db.migrate.latest({
      directory: path.resolve(__dirname, '..', 'database', 'migrations'),
    });
    logger.info('Database migrations completed');
  } catch (error) {
    logger.error('Failed to run migrations', error);
    throw error;
  }
}

async function seedAdminIfMissing(): Promise<void> {
  try {
    const db = getDatabase();
    const adminUser = await db('users').where({ username: 'admin' }).first();
    if (adminUser) {
      logger.info('Admin user already exists, skipping seed');
      return;
    }

    const bcrypt = await import('bcryptjs');
    const { v4: uuidv4 } = await import('uuid');
    const passwordHash = await bcrypt.hash('Admin@12345', 12);

    await db('users').insert({
      id: uuidv4(),
      username: 'admin',
      email: 'admin@fleetdashboard.com',
      password_hash: passwordHash,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'super_admin',
      is_active: true,
      is_first_login: true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
    logger.info('Default admin user seeded successfully');
  } catch (error) {
    logger.error('Failed to seed admin user', error);
    throw error;
  }
}

async function startServer(): Promise<void> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }
    logger.info('Database connected successfully');

    await runMigrations();
    await seedAdminIfMissing();

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`API base path: /api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await closeDatabaseConnection();
  process.exit(0);
});

startServer();

export default app;
