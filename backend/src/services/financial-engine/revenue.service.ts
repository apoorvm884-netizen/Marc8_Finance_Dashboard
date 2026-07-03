import { getDatabase } from '../../config/database';

export class RevenueService {
  calculateNetRevenue(grossFare: number, doorstepCharges: number, platformCommission: number): number {
    return Math.round((grossFare + doorstepCharges - platformCommission) * 100) / 100;
  }

  calculateBookingRevenue(booking: { gross_fare: number; doorstep_charges: number; platform_commission: number; discount?: number }): number {
    return this.calculateNetRevenue(booking.gross_fare, booking.doorstep_charges, booking.platform_commission);
  }

  calculateBookingCommission(grossFare: number, commissionPercent: number): number {
    return Math.round((grossFare * commissionPercent / 100) * 100) / 100;
  }

  calculateBookingRefund(refundAmount: number): number {
    return Math.max(0, Math.round(refundAmount * 100) / 100);
  }

  validateFinancials(data: { gross_fare: number; doorstep_charges: number; platform_commission: number }): void {
    if (data.gross_fare < 0) throw new Error('Gross fare must be 0 or greater');
    if (data.doorstep_charges < 0) throw new Error('Doorstep charges must be 0 or greater');
    if (data.platform_commission < 0) throw new Error('Platform commission must be 0 or greater');
  }

  async getTodaysRevenue(): Promise<number> {
    const db = getDatabase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const result = await db('bookings')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .where('booking_date_time', '>=', todayStart)
      .sum('net_revenue as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getWeeklyRevenue(): Promise<number> {
    const db = getDatabase();
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).toISOString();
    const result = await db('bookings')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .where('booking_date_time', '>=', weekStart)
      .sum('net_revenue as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getMonthlyRevenue(): Promise<number> {
    const db = getDatabase();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const result = await db('bookings')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .where('booking_date_time', '>=', monthStart)
      .sum('net_revenue as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getYearlyRevenue(): Promise<number> {
    const db = getDatabase();
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const result = await db('bookings')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .where('booking_date_time', '>=', yearStart)
      .sum('net_revenue as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getVehicleRevenue(vehicleId: string): Promise<number> {
    const db = getDatabase();
    const result = await db('bookings')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .where('vehicle_id', vehicleId)
      .sum('net_revenue as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getPlatformRevenue(platformId: string): Promise<number> {
    const db = getDatabase();
    const result = await db('bookings')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .where('platform_id', platformId)
      .sum('net_revenue as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getPlatformPerformance(): Promise<{ platform_id: string; platform_name: string; total_revenue: number; total_commission: number; booking_count: number }[]> {
    const db = getDatabase();
    const rows = await db('bookings')
      .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
      .whereNull('bookings.deleted_at')
      .whereIn('bookings.status', ['COMPLETED', 'CONFIRMED'])
      .groupBy('bookings.platform_id', 'platforms.name')
      .select(
        'bookings.platform_id',
        'platforms.name as platform_name',
        db.raw('COUNT(*)::int as booking_count')
      )
      .sum('bookings.net_revenue as total_revenue')
      .sum('bookings.platform_commission as total_commission');
    return rows.map((r: any) => ({
      platform_id: r.platform_id,
      platform_name: r.platform_name || 'Unknown',
      total_revenue: Math.round(Number(r.total_revenue ?? 0) * 100) / 100,
      total_commission: Math.round(Number(r.total_commission ?? 0) * 100) / 100,
      booking_count: Number(r.booking_count ?? 0),
    }));
  }

  async getRevenueTrend(months: number = 12): Promise<{ month: string; total: number }[]> {
    const db = getDatabase();
    const rows = await db('bookings')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .groupBy(db.raw("to_char(booking_date_time, 'YYYY-MM')"))
      .select(db.raw("to_char(booking_date_time, 'YYYY-MM') as month"))
      .sum('net_revenue as total')
      .orderBy('month', 'asc')
      .limit(months);
    return rows.map((r: any) => ({ month: r.month, total: Math.round(Number(r.total ?? 0) * 100) / 100 }));
  }

  async getRevenueGrowth(): Promise<{ monthly_growth: number; quarterly_growth: number; yearly_growth: number }> {
    const db = getDatabase();
    const now = new Date();

    const thisMonth = await this.getMonthlyRevenue();

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthResult = await db('bookings')
      .whereNull('deleted_at').whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .where('booking_date_time', '>=', lastMonthStart)
      .where('booking_date_time', '<', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
      .sum('net_revenue as total').first();
    const lastMonthRevenue = Math.round(Number(lastMonthResult?.total ?? 0) * 100) / 100;
    const monthlyGrowth = lastMonthRevenue > 0 ? Math.round(((thisMonth - lastMonthRevenue) / lastMonthRevenue) * 10000) / 100 : 0;

    const qtrStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString();
    const qtrRevenue = await this.getRevenueForPeriod(qtrStart, now.toISOString());

    const lastQtrStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1).toISOString();
    const lastQtrEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString();
    const lastQtrRevenue = await this.getRevenueForPeriod(lastQtrStart, lastQtrEnd);
    const quarterlyGrowth = lastQtrRevenue > 0 ? Math.round(((qtrRevenue - lastQtrRevenue) / lastQtrRevenue) * 10000) / 100 : 0;

    const yrStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const yrRevenue = await this.getRevenueForPeriod(yrStart, now.toISOString());

    const lastYrStart = new Date(now.getFullYear() - 1, 0, 1).toISOString();
    const lastYrEnd = new Date(now.getFullYear(), 0, 1).toISOString();
    const lastYrRevenue = await this.getRevenueForPeriod(lastYrStart, lastYrEnd);
    const yearlyGrowth = lastYrRevenue > 0 ? Math.round(((yrRevenue - lastYrRevenue) / lastYrRevenue) * 10000) / 100 : 0;

    return { monthly_growth: monthlyGrowth, quarterly_growth: quarterlyGrowth, yearly_growth: yearlyGrowth };
  }

  private async getRevenueForPeriod(from: string, to: string): Promise<number> {
    const db = getDatabase();
    const result = await db('bookings')
      .whereNull('deleted_at').whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .where('booking_date_time', '>=', from)
      .where('booking_date_time', '<', to)
      .sum('net_revenue as total').first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getRevenueHeatmap(): Promise<{ date: string; total: number }[]> {
    const db = getDatabase();
    const rows = await db('bookings')
      .whereNull('deleted_at').whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .groupBy(db.raw("date(booking_date_time)::text"))
      .select(db.raw("date(booking_date_time)::text as date"))
      .sum('net_revenue as total')
      .orderBy('date', 'asc')
      .limit(90);
    return rows.map((r: any) => ({ date: r.date, total: Math.round(Number(r.total ?? 0) * 100) / 100 }));
  }
}

export const revenueService = new RevenueService();
