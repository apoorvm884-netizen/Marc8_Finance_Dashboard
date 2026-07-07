import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../../src/services/auth.service';

vi.mock('../../../src/config/database', () => ({
  getDatabase: vi.fn(),
}));

vi.mock('../../../src/utils/helpers', async () => {
  const actual = await vi.importActual('../../../src/utils/helpers');
  return {
    ...actual,
    generateToken: vi.fn().mockReturnValue('mock-jwt-token'),
    comparePassword: vi.fn().mockResolvedValue(true),
  };
});

import { getDatabase } from '../../../src/config/database';

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
    insert: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
  };
  const db: any = vi.fn(() => qb);
  db.fn = { now: vi.fn().mockReturnValue('2024-01-01T00:00:00.000Z') };
  return db;
}

const mockUser = {
  id: 'user-001',
  username: 'admin',
  email: 'admin@fleetdashboard.com',
  password_hash: '$2a$12$hashedpassword',
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
};

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue(mockUser);
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const result = await authService.login({ username: 'admin', password: 'Admin@12345' });

      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.user.username).toBe('admin');
    });

    it('should throw UnauthorizedError for invalid username', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue(undefined);
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      await expect(authService.login({ username: 'wrong', password: 'Admin@12345' }))
        .rejects.toThrow('Invalid username or password');
    });

    it('should throw UnauthorizedError for inactive account', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue({ ...mockUser, is_active: false });
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      await expect(authService.login({ username: 'admin', password: 'Admin@12345' }))
        .rejects.toThrow('Account is deactivated');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue(mockUser);
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const result = await authService.changePassword('user-001', {
        currentPassword: 'OldPass@123',
        newPassword: 'NewPass@456',
        confirmPassword: 'NewPass@456',
      });

      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should throw NotFoundError for non-existent user', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue(undefined);
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      await expect(authService.changePassword('nonexistent', {
        currentPassword: 'OldPass@123',
        newPassword: 'NewPass@456',
        confirmPassword: 'NewPass@456',
      })).rejects.toThrow('User not found');
    });
  });

  describe('getProfile', () => {
    it('should return sanitized user profile', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue(mockUser);
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const result = await authService.getProfile('user-001');

      expect(result).not.toHaveProperty('password_hash');
      expect(result.username).toBe('admin');
    });
  });
});
