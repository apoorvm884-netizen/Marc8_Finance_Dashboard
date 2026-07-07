import { describe, it, expect, vi, beforeEach } from 'vitest';
import { revenueService } from '../../../src/services/financial-engine/revenue.service';

vi.mock('../../../src/config/database', () => ({
  getDatabase: vi.fn(),
}));

import { getDatabase } from '../../../src/config/database';

function createMockDb() {
  const qb = {
    where: vi.fn().mockReturnThis(),
    whereNull: vi.fn().mockReturnThis(),
    whereIn: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue({ total: 0 }),
    sum: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    clone: vi.fn().mockReturnThis(),
    count: vi.fn().mockReturnThis(),
  };
  const db: any = vi.fn(() => qb);
  db.fn = { now: vi.fn().mockReturnValue('2024-01-01T00:00:00.000Z') };
  db.raw = vi.fn((str: string) => str);
  return db;
}

describe('RevenueService (Financial Engine)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateNetRevenue', () => {
    it('should calculate net revenue correctly', () => {
      expect(revenueService.calculateNetRevenue(1000, 50, 150)).toBe(900);
    });

    it('should handle zero values', () => {
      expect(revenueService.calculateNetRevenue(0, 0, 0)).toBe(0);
    });

    it('should handle negative commission', () => {
      expect(revenueService.calculateNetRevenue(1000, 0, -100)).toBe(1100);
    });

    it('should round to 2 decimal places', () => {
      expect(revenueService.calculateNetRevenue(100.33, 10.22, 5.55)).toBe(105);
    });
  });

  describe('calculateBookingCommission', () => {
    it('should calculate commission percentage correctly', () => {
      expect(revenueService.calculateBookingCommission(1000, 15)).toBe(150);
    });

    it('should handle 0% commission', () => {
      expect(revenueService.calculateBookingCommission(1000, 0)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(revenueService.calculateBookingCommission(99.99, 12.5)).toBe(12.5);
    });
  });

  describe('calculateBookingRefund', () => {
    it('should return valid refund amount', () => {
      expect(revenueService.calculateBookingRefund(500)).toBe(500);
    });

    it('should cap refund at 0 for negative values', () => {
      expect(revenueService.calculateBookingRefund(-100)).toBe(0);
    });
  });

  describe('validateFinancials', () => {
    it('should not throw for valid data', () => {
      expect(() => revenueService.validateFinancials({ gross_fare: 1000, doorstep_charges: 50, platform_commission: 150 }))
        .not.toThrow();
    });

    it('should throw for negative gross fare', () => {
      expect(() => revenueService.validateFinancials({ gross_fare: -100, doorstep_charges: 0, platform_commission: 0 }))
        .toThrow('Gross fare must be 0 or greater');
    });

    it('should throw for negative doorstep charges', () => {
      expect(() => revenueService.validateFinancials({ gross_fare: 1000, doorstep_charges: -10, platform_commission: 0 }))
        .toThrow('Doorstep charges must be 0 or greater');
    });

    it('should throw for negative platform commission', () => {
      expect(() => revenueService.validateFinancials({ gross_fare: 1000, doorstep_charges: 0, platform_commission: -50 }))
        .toThrow('Platform commission must be 0 or greater');
    });
  });

  describe('database queries', () => {
    it('should return today revenue from database', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue({ total: 15000 });
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const result = await revenueService.getTodaysRevenue();
      expect(result).toBe(15000);
    });

    it('should return 0 when no revenue data', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue({ total: null });
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const result = await revenueService.getTodaysRevenue();
      expect(result).toBe(0);
    });

    it('should return monthly revenue from database', async () => {
      const mockDb = createMockDb();
      mockDb().first.mockResolvedValue({ total: 450000 });
      vi.mocked(getDatabase).mockReturnValue(mockDb);

      const result = await revenueService.getMonthlyRevenue();
      expect(result).toBe(450000);
    });
  });
});
