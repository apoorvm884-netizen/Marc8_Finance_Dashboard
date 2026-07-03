export type SettlementStatus =
  | 'draft' | 'calculated' | 'pending_approval' | 'approved' | 'rejected'
  | 'payment_initiated' | 'paid' | 'partially_paid' | 'cancelled' | 'closed';

export type SettlementType = 'owner' | 'platform';

export interface Settlement {
  id: string;
  settlement_number: string;
  period_start: string;
  period_end: string;
  owner_id: string | null;
  vehicle_id: string | null;
  platform_id: string | null;
  settlement_type: SettlementType;
  total_gross_revenue: number;
  total_platform_commission: number;
  total_taxes: number;
  total_adjustments: number;
  total_approved_expenses: number;
  net_revenue: number;
  owner_share: number;
  marc8_share: number;
  revenue_model: string;
  owner_revenue_percentage: number | null;
  status: SettlementStatus;
  total_paid: number;
  balance_due: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  owner_name?: string;
  linked_bookings?: SettlementBooking[];
  linked_expenses?: SettlementExpense[];
  distributions?: SettlementDistribution[];
  approvals?: SettlementApproval[];
  payments?: SettlementPayment[];
  documents?: SettlementDocument[];
}

export interface CreateSettlementDTO {
  period_start: string;
  period_end: string;
  owner_id?: string | null;
  vehicle_id?: string | null;
  platform_id?: string | null;
  settlement_type?: SettlementType;
  revenue_model?: string;
  notes?: string | null;
}

export interface UpdateSettlementDTO {
  period_start?: string;
  period_end?: string;
  owner_id?: string | null;
  vehicle_id?: string | null;
  platform_id?: string | null;
  settlement_type?: SettlementType;
  revenue_model?: string;
  notes?: string | null;
  status?: SettlementStatus;
}

export interface SettlementBooking {
  id: string;
  settlement_id: string;
  booking_id: string;
  gross_fare: number;
  doorstep_charges: number;
  platform_commission: number;
  discount: number;
  taxes: number;
  net_revenue: number;
  created_at: string;
  external_booking_id?: string;
  vehicle_id?: string;
}

export interface SettlementExpense {
  id: string;
  settlement_id: string;
  expense_id: string;
  allocation_type: string;
  amount: number;
  created_at: string;
  expense_category_id?: string;
  vendor?: string;
}

export interface SettlementDistribution {
  id: string;
  settlement_id: string;
  recipient_type: string;
  recipient_name: string;
  amount: number;
  percentage: number | null;
  description: string | null;
  created_at: string;
}

export interface SettlementApproval {
  id: string;
  settlement_id: string;
  approved_by: string;
  approved_at: string;
  status: string;
  remarks: string | null;
  created_at: string;
  approved_by_name?: string;
}

export interface SettlementPayment {
  id: string;
  settlement_id: string;
  payment_method: string;
  amount: number;
  payment_date: string;
  reference_number: string | null;
  transaction_id: string | null;
  remarks: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateSettlementPaymentDTO {
  payment_method: string;
  amount: number;
  payment_date: string;
  reference_number?: string | null;
  transaction_id?: string | null;
  remarks?: string | null;
}

export interface SettlementDocument {
  id: string;
  settlement_id: string;
  document_name: string;
  file_url: string | null;
  document_type: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface SettlementQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  status?: string;
  settlement_type?: SettlementType;
  owner_id?: string;
  vehicle_id?: string;
  period_start?: string;
  period_end?: string;
  include_deleted?: string;
}

export interface RunPipelineDTO {
  period_start: string;
  period_end: string;
  owner_id?: string | null;
  vehicle_id?: string | null;
  platform_id?: string | null;
  revenue_model?: string;
  notes?: string | null;
}

export interface UpdateStatusDTO {
  status: SettlementStatus;
  remarks?: string | null;
}

export interface SettlementDashboardMetrics {
  total_settlements: number;
  settlement_due_amount: number;
  settlement_paid_amount: number;
  pending_approvals: number;
  upcoming_payouts: number;
  owner_liability: number;
  platform_liability: number;
  cash_requirement: number;
  monthly_distribution: { month: string; amount: number }[];
  top_owners: { owner_id: string; owner_name: string; total_amount: number }[];
  distribution_trends: { month: string; owner_share: number; marc8_share: number }[];
}
