export interface RevenueAnalytics {
  trend: { month: string; total: number }[];
  growth: { monthly_growth: number; quarterly_growth: number; yearly_growth: number };
  platform_performance: { platform_id: string; platform_name: string; total_revenue: number; total_commission: number; booking_count: number }[];
  vehicle_revenue: { vehicle_id: string; vehicle_number: string; total_revenue: number }[];
  heatmap: { date: string; total: number }[];
}

export interface ExpenseAnalytics {
  trend: { month: string; total: number }[];
  by_category: { category_id: string; category_name: string; total: number; percentage: number }[];
  by_payment_mode: { payment_mode_id: string; payment_mode_name: string; total: number }[];
  by_vehicle: { vehicle_id: string; vehicle_number: string; total: number }[];
  large_expenses: any[];
}

export interface ProfitAnalytics {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  trend: { month: string; total: number }[];
  net_margin: number;
  vehicle_profitability: { vehicle_id: string; vehicle_number: string; revenue: number; expense: number; profit: number; margin: number }[];
}

export interface VehiclePerformance {
  vehicle_profitability: { vehicle_id: string; vehicle_number: string; revenue: number; expense: number; profit: number; margin: number }[];
  top_performing: { vehicle_id: string; vehicle_number: string; total_revenue: number }[];
  lowest_performing: { vehicle_id: string; vehicle_number: string; total_revenue: number }[];
  fleet_summary: { total_vehicles: number; active_vehicles: number; booked_vehicles: number; maintenance_vehicles: number; utilization_rate: number };
}

export interface PlatformComparison {
  platform_name: string;
  revenue: number;
  commission: number;
  booking_count: number;
  avg_revenue_per_booking: number;
}

export interface CombinedAnalytics {
  revenue: RevenueAnalytics;
  expense: ExpenseAnalytics;
  profit: ProfitAnalytics;
  vehicle_performance: VehiclePerformance;
  platform_comparison: PlatformComparison[];
  cash_flow: { month: string; inflow: number; outflow: number; net: number }[];
  revenue_vs_expense_vs_profit: { month: string; revenue: number; expense: number; profit: number }[];
  growth: { monthly_growth: number; quarterly_growth: number; yearly_growth: number };
}
