export type OutstandingStatus = 'upcoming' | 'due_today' | 'overdue' | 'paid' | 'cancelled' | 'partially_paid';

export type OutstandingPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Outstanding {
  id: string;
  title: string;
  outstanding_category_id: string;
  vehicle_id: string | null;
  platform_id: string | null;
  vendor: string | null;
  amount: number;
  due_date: string;
  priority: OutstandingPriority;
  status: OutstandingStatus;
  notes: string | null;
  paid_as_expense_id: string | null;
  paid_amount: number | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  vehicle_number?: string;
  vehicle_name?: string;
  category_name?: string;
  category_color?: string;
  platform_name?: string;
  expense_amount?: number;
  expense_status?: string;
}

export interface CreateOutstandingDTO {
  title: string;
  outstanding_category_id: string;
  vehicle_id?: string | null;
  platform_id?: string | null;
  vendor?: string | null;
  amount: number;
  due_date: string;
  priority?: OutstandingPriority;
  status?: OutstandingStatus;
  notes?: string | null;
}

export interface UpdateOutstandingDTO {
  title?: string;
  outstanding_category_id?: string;
  vehicle_id?: string | null;
  platform_id?: string | null;
  vendor?: string | null;
  amount?: number;
  due_date?: string;
  priority?: OutstandingPriority;
  status?: OutstandingStatus;
  notes?: string | null;
}

export interface MarkAsPaidDTO {
  payment_mode_id: string;
  expense_category_id: string;
  paid_amount?: number;
  paid_date?: string;
  notes?: string | null;
}

export interface PaymentPlannerData {
  total_outstanding: number;
  due_today: number;
  due_this_week: number;
  due_this_month: number;
  overdue_amount: number;
  upcoming_payments: number;
  largest_liability: { title: string; amount: number } | null;
}

export interface CashRequirementForecast {
  next_7_days: number;
  next_30_days: number;
  current_month: number;
  quarter: number;
  year: number;
  outstanding_breakdown: { category_name: string; total: number }[];
  expense_forecast: { month: string; total: number }[];
}

export interface VehicleFinancialIntelligence {
  revenue: number;
  expense: number;
  outstanding: number;
  profit: number;
  net_margin: number;
  documents_due: {
    insurance: string | null;
    permit: string | null;
    road_tax: string | null;
    fitness: string | null;
    pollution: string | null;
    rc: string | null;
    service: string | null;
  };
  revenue_trend: { month: string; total: number }[];
  expense_trend: { month: string; total: number }[];
  outstanding_trend: { month: string; total: number }[];
}

export interface PlatformAnalyticsData {
  revenue_by_platform: {
    platform_id: string;
    platform_name: string;
    total_revenue: number;
    gross_fare: number;
    commission: number;
  }[];
  bookings_by_platform: {
    platform_id: string;
    total: number;
  }[];
  outstanding_by_platform: {
    platform_id: string;
    platform_name: string;
    total: number;
  }[];
  total_platforms: number;
}
