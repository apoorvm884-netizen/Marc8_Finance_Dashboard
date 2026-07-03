import { financialEngine } from './financial-engine';

export class RevenueCalculator {
  static calculateNetRevenue(grossFare: number, doorstepCharges: number, platformCommission: number): number {
    return financialEngine.revenue.calculateNetRevenue(grossFare, doorstepCharges, platformCommission);
  }

  static validateFinancials(data: { gross_fare: number; doorstep_charges: number; platform_commission: number }): void {
    return financialEngine.revenue.validateFinancials(data);
  }

  static calculateDashboardMetrics(bookings: any[]): any {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    let todaysRevenue = 0;
    let monthlyRevenue = 0;
    const platformMap = new Map<string, { platform_id: string; platform_name: string; total: number }>();
    const vehicleMap = new Map<string, { vehicle_id: string; vehicle_number: string; total: number }>();

    for (const booking of bookings) {
      const revenue = Number(booking.net_revenue) || 0;
      const createdAt = booking.created_at;

      if (createdAt >= todayStart) todaysRevenue += revenue;
      if (createdAt >= monthStart) monthlyRevenue += revenue;

      const platformId = booking.platform_id;
      if (!platformMap.has(platformId)) {
        platformMap.set(platformId, { platform_id: platformId, platform_name: booking.platform_name || 'Unknown', total: 0 });
      }
      platformMap.get(platformId)!.total += revenue;

      const vehicleId = booking.vehicle_id;
      if (!vehicleMap.has(vehicleId)) {
        vehicleMap.set(vehicleId, { vehicle_id: vehicleId, vehicle_number: booking.vehicle_number || 'Unknown', total: 0 });
      }
      vehicleMap.get(vehicleId)!.total += revenue;
    }

    return {
      todays_revenue: Math.round(todaysRevenue * 100) / 100,
      monthly_revenue: Math.round(monthlyRevenue * 100) / 100,
      revenue_by_platform: Array.from(platformMap.values()),
      revenue_by_vehicle: Array.from(vehicleMap.values()),
    };
  }
}
