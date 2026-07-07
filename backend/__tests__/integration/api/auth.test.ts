import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../../src/config/database', () => ({
  getDatabase: vi.fn(),
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
  closeDatabaseConnection: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../src/utils/helpers', async () => {
  const actual = await vi.importActual('../../../src/utils/helpers');
  return {
    ...actual,
    generateToken: vi.fn().mockReturnValue('integration-test-jwt-token'),
    comparePassword: vi.fn().mockResolvedValue(true),
  };
});

vi.mock('../../../src/config/env', () => ({
  env: {
    PORT: 0,
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-jwt-secret-for-testing',
    JWT_EXPIRES_IN: '1h',
    CORS_ORIGIN: '*',
    RATE_LIMIT_WINDOW: 15,
    RATE_LIMIT_MAX: 100,
    LOG_LEVEL: 'silent',
  },
}));

vi.mock('../../../src/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { errorHandler } from '../../../src/middleware/error-handler';
import routes from '../../../src/routes';
import { getDatabase } from '../../../src/config/database';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/api/v1', routes);
app.use(errorHandler);

function createMockDb() {
  const qb = {
    where: vi.fn().mockReturnThis(),
    whereNull: vi.fn().mockReturnThis(),
    whereNot: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    clone: vi.fn().mockReturnThis(),
    count: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
  };
  const db: any = vi.fn(() => qb);
  db.fn = { now: vi.fn().mockReturnValue('2024-01-01T00:00:00.000Z') };
  return db;
}

describe('Auth API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 with token for valid credentials', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue({
        id: 'user-001',
        username: 'admin',
        email: 'admin@fleetdashboard.com',
        password_hash: '$2a$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5GzCcC4jKCHa6BFGQC5y5XHi',
        first_name: 'System',
        last_name: 'Administrator',
        role: 'super_admin',
        is_active: true,
        is_first_login: true,
        last_login_at: null,
        restrictions: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        created_by: null,
        updated_by: null,
      });
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'admin', password: 'Admin@12345' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token', 'integration-test-jwt-token');
      expect(res.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should return 401 for invalid credentials', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue(undefined);
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'wrong', password: 'WrongPass1!' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it('should return 422 for validation errors', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: '', password: 'short' })
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 422 for missing password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'admin' })
        .expect(422);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return health check status', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'ok');
    });
  });
});
