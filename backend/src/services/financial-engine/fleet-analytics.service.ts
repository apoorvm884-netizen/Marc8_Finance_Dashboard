import { getDatabase } from '../../config/database';

export class FleetAnalyticsService {
  async getFleetSummary(): Promise<{
    total_vehicles: number;
    active_vehicles: number;
    booked_vehicles: number;
    maintenance_vehicles: number;
    inactive_vehicles: number;
    utilization_rate: number;
  }> {
    const db = getDatabase();
    const vehicles = await db('vehicles')
      .whereNull('deleted_at')
      .select('status');

    const total = vehicles.length;
    const active = vehicles.filter((v: any) => v.status === 'AVAILABLE').length;
    const booked = vehicles.filter((v: any) => v.status === 'BOOKED').length;
    const maintenance = vehicles.filter((v: any) => v.status === 'MAINTENANCE').length;
    const inactive = vehicles.filter((v: any) => v.status === 'INACTIVE').length;

    const activeForUtil = total - inactive;
    const utilizationRate = activeForUtil > 0 ? Math.round((booked / activeForUtil) * 10000) / 100 : 0;

    return {
      total_vehicles: total,
      active_vehicles: active,
      booked_vehicles: booked,
      maintenance_vehicles: maintenance,
      inactive_vehicles: inactive,
      utilization_rate: utilizationRate,
    };
  }

  async calculateFleetUtilization(): Promise<number> {
    const summary = await this.getFleetSummary();
    return summary.utilization_rate;
  }

  async getRevenuePerVehicle(): Promise<{ vehicle_id: string; vehicle_number: string; total_revenue: number }[]> {
    const db = getDatabase();
    const rows = await db('bookings')
      .leftJoin('vehicles', 'bookings.vehicle_id', 'vehicles.id')
      .whereNull('bookings.deleted_at')
      .whereIn('bookings.status', ['COMPLETED', 'CONFIRMED'])
      .groupBy('bookings.vehicle_id', 'vehicles.vehicle_number')
      .select('bookings.vehicle_id', 'vehicles.vehicle_number')
      .sum('bookings.net_revenue as total_revenue')
      .orderBy('total_revenue', 'desc');
    return rows.map((r: any) => ({
      vehicle_id: r.vehicle_id,
      vehicle_number: r.vehicle_number || 'Unknown',
      total_revenue: Math.round(Number(r.total_revenue ?? 0) * 100) / 100,
    }));
  }

  async getExpensePerVehicle(): Promise<{ vehicle_id: string; vehicle_number: string; total_expense: number }[]> {
    const db = getDatabase();
    const rows = await db('expenses')
      .leftJoin('vehicles', 'expenses.vehicle_id', 'vehicles.id')
      .whereNull('expenses.deleted_at')
      .whereIn('expenses.status', ['APPROVED', 'REIMBURSED'])
      .whereNotNull('expenses.vehicle_id')
      .groupBy('expenses.vehicle_id', 'vehicles.vehicle_number')
      .select('expenses.vehicle_id', 'vehicles.vehicle_number')
      .sum('expenses.amount as total_expense')
      .orderBy('total_expense', 'desc');
    return rows.map((r: any) => ({
      vehicle_id: r.vehicle_id,
      vehicle_number: r.vehicle_number || 'Unknown',
      total_expense: Math.round(Number(r.total_expense ?? 0) * 100) / 100,
    }));
  }

  async getAverageRevenuePerVehicle(): Promise<number> {
    const [revenuePerVeh, summary] = await Promise.all([
      this.getRevenuePerVehicle(),
      this.getFleetSummary(),
    ]);
    const totalRevenue = revenuePerVeh.reduce((s, v) => s + v.total_revenue, 0);
    const vehicleCount = summary.total_vehicles;
    return vehicleCount > 0 ? Math.round((totalRevenue / vehicleCount) * 100) / 100 : 0;
  }

  async getAverageExpensePerVehicle(): Promise<number> {
    const [expensePerVeh, summary] = await Promise.all([
      this.getExpensePerVehicle(),
      this.getFleetSummary(),
    ]);
    const totalExpense = expensePerVeh.reduce((s, v) => s + v.total_expense, 0);
    const vehicleCount = summary.total_vehicles;
    return vehicleCount > 0 ? Math.round((totalExpense / vehicleCount) * 100) / 100 : 0;
  }

  async calculateVehicleRevenue(vehicleId: string): Promise<number> {
    const db = getDatabase();
    const result = await db('bookings')
      .whereNull('deleted_at').whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .where('vehicle_id', vehicleId)
      .sum('net_revenue as total').first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async calculateVehicleExpense(vehicleId: string): Promise<number> {
    const db = getDatabase();
    const result = await db('expenses')
      .whereNull('deleted_at').whereIn('status', ['APPROVED', 'REIMBURSED'])
      .where('vehicle_id', vehicleId)
      .sum('amount as total').first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async calculateVehicleProfit(vehicleId: string): Promise<{ revenue: number; expense: number; profit: number }> {
    const [revenue, expense] = await Promise.all([
      this.calculateVehicleRevenue(vehicleId),
      this.calculateVehicleExpense(vehicleId),
    ]);
    return {
      revenue: Math.round(revenue * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      profit: Math.round((revenue - expense) * 100) / 100,
    };
  }

  async getTopPerformingVehicle(limit: number = 5): Promise<{ vehicle_id: string; vehicle_number: string; total_revenue: number }[]> {
    const data = await this.getRevenuePerVehicle();
    return data.slice(0, limit);
  }

  async getLowestPerformingVehicle(limit: number = 5): Promise<{ vehicle_id: string; vehicle_number: string; total_revenue: number }[]> {
    const data = await this.getRevenuePerVehicle();
    return data.slice(-limit).reverse();
  }

  async getVehicleProfitability(): Promise<{ vehicle_id: string; vehicle_number: string; revenue: number; expense: number; profit: number; margin: number }[]> {
    const [revenuePerVeh, expensePerVeh] = await Promise.all([
      this.getRevenuePerVehicle(),
      this.getExpensePerVehicle(),
    ]);
    const profitMap = new Map<string, { vehicle_number: string; revenue: number; expense: number; profit: number }>();
    for (const v of revenuePerVeh) {
      profitMap.set(v.vehicle_id, { vehicle_number: v.vehicle_number, revenue: v.total_revenue, expense: 0, profit: v.total_revenue });
    }
    for (const v of expensePerVeh) {
      const existing = profitMap.get(v.vehicle_id);
      if (existing) {
        existing.expense = v.total_expense;
        existing.profit = Math.round((existing.revenue - v.total_expense) * 100) / 100;
      } else {
        profitMap.set(v.vehicle_id, { vehicle_number: v.vehicle_number, revenue: 0, expense: v.total_expense, profit: -v.total_expense });
      }
    }
    return Array.from(profitMap.entries())
      .map(([vehicle_id, vals]) => ({
        vehicle_id,
        vehicle_number: vals.vehicle_number,
        revenue: Math.round(vals.revenue * 100) / 100,
        expense: Math.round(vals.expense * 100) / 100,
        profit: Math.round(vals.profit * 100) / 100,
        margin: vals.revenue > 0 ? Math.round((vals.profit / vals.revenue) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit);
  }
}

export const fleetAnalyticsService = new FleetAnalyticsService();
