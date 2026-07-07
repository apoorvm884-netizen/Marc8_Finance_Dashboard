import { describe, it, expect, vi, beforeEach } from 'vitest';
import { masterService } from '../../../src/services/master.service';

vi.mock('../../../src/config/database', () => ({
  getDatabase: vi.fn(),
}));

import { getDatabase } from '../../../src/config/database';

function createMockDb() {
  const qb = {
    where: vi.fn().mockReturnThis(),
    whereNull: vi.fn().mockReturnThis(),
    whereNot: vi.fn().mockReturnThis(),
    whereIn: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    clone: vi.fn().mockReturnThis(),
    count: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockResolvedValue(undefined),
    returning: vi.fn().mockReturnThis(),
  };
  const db: any = vi.fn(() => qb);
  db.fn = { now: vi.fn().mockReturnValue('2024-01-01T00:00:00.000Z') };
  return db;
}

const mockTypes = [
  { id: 't1', code: 'platform', name: 'Platforms', description: null, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 't2', code: 'fuel_type', name: 'Fuel Types', description: null, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

const mockPlatformType = { id: 't1', code: 'platform', name: 'Platforms', description: null, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' };

describe('MasterService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMasterTypes', () => {
    it('should return all master types ordered by code', async () => {
      const mockDb = createMockDb();
      mockDb().orderBy.mockResolvedValue(mockTypes);
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const result = await masterService.getMasterTypes();

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('platform');
    });
  });

  describe('getMasterValues', () => {
    it('should return paginated master values', async () => {
      const mockDb = createMockDb();
      const qb = mockDb();
      qb.first.mockResolvedValue(mockPlatformType);

      const countQb = {
        first: vi.fn().mockResolvedValue({ count: '2' }),
      };
      const cloneQb = { count: vi.fn().mockReturnValue(countQb) };
      qb.clone.mockReturnValue(cloneQb);
      qb.offset.mockResolvedValue([
        { id: 'v1', master_type_id: 't1', code: 'zoomcar', name: 'Zoomcar', display_order: 1, is_active: true },
        { id: 'v2', master_type_id: 't1', code: 'revv', name: 'Revv', display_order: 2, is_active: true },
      ]);
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const result = await masterService.getMasterValues('platform', { page: '1', limit: '10' });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should throw NotFoundError for invalid master type', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue(undefined);
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      await expect(masterService.getMasterValues('invalid_type', {}))
        .rejects.toThrow("Master type 'invalid_type' not found");
    });
  });

  describe('createMasterValue', () => {
    it('should create a new master value', async () => {
      const newValue = { id: 'v3', master_type_id: 't1', code: 'bharat', name: 'Bharat Cars', display_order: 3, is_active: true };
      const mockDb = createMockDb();
      const qb = mockDb();
      qb.first
        .mockResolvedValueOnce(mockPlatformType)
        .mockResolvedValueOnce(undefined);
      qb.returning.mockResolvedValue([newValue]);
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const result = await masterService.createMasterValue('platform', { code: 'bharat', name: 'Bharat Cars' });

      expect(result.code).toBe('bharat');
      expect(result.name).toBe('Bharat Cars');
    });

    it('should throw ConflictError for duplicate code', async () => {
      const mockDb = createMockDb();
      const qb = mockDb();
      qb.first
        .mockResolvedValueOnce(mockPlatformType)
        .mockResolvedValueOnce({ id: 'v1', code: 'zoomcar', name: 'Zoomcar' });
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      await expect(masterService.createMasterValue('platform', { code: 'zoomcar', name: 'Zoomcar' }))
        .rejects.toThrow("Code 'zoomcar' already exists for master type 'platform'");
    });
  });
});
