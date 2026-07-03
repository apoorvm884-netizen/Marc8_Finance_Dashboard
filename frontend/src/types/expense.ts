export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

export interface Expense {
  id: string;
  vehicle_id: string | null;
  expense_category_id: string;
  payment_mode_id: string;
  expense_date: string;
  amount: number;
  vendor: string | null;
  invoice_number: string | null;
  remarks: string | null;
  status: ExpenseStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  vehicle_number?: string;
  vehicle_name?: string;
  category_name?: string;
  payment_mode_name?: string;
}

export interface CreateExpenseDTO {
  vehicle_id?: string | null;
  expense_category_id: string;
  payment_mode_id: string;
  expense_date?: string;
  amount: number;
  vendor?: string | null;
  invoice_number?: string | null;
  status?: ExpenseStatus;
  remarks?: string | null;
}

export interface UpdateExpenseDTO {
  vehicle_id?: string | null;
  expense_category_id?: string;
  payment_mode_id?: string;
  expense_date?: string;
  amount?: number;
  vendor?: string | null;
  invoice_number?: string | null;
  status?: ExpenseStatus;
  remarks?: string | null;
}
