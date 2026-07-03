import { z } from 'zod';

const expenseStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED'] as const;

export const createExpenseSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID').optional().nullable(),
  expense_category_id: z.string().uuid('Invalid expense category ID'),
  payment_mode_id: z.string().uuid('Invalid payment mode ID'),
  expense_date: z.string().optional(),
  amount: z.number().min(0, 'Amount must be 0 or greater'),
  vendor: z.string().max(255, 'Vendor must not exceed 255 characters').optional().nullable(),
  invoice_number: z.string().max(255, 'Invoice number must not exceed 255 characters').optional().nullable(),
  status: z.enum(expenseStatuses).optional().default('PENDING'),
  remarks: z.string().max(2000, 'Remarks must not exceed 2000 characters').optional().nullable(),
});

export const updateExpenseSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID').optional().nullable(),
  expense_category_id: z.string().uuid('Invalid expense category ID').optional(),
  payment_mode_id: z.string().uuid('Invalid payment mode ID').optional(),
  expense_date: z.string().optional(),
  amount: z.number().min(0, 'Amount must be 0 or greater').optional(),
  vendor: z.string().max(255).optional().nullable(),
  invoice_number: z.string().max(255).optional().nullable(),
  status: z.enum(expenseStatuses).optional(),
  remarks: z.string().max(2000).optional().nullable(),
});

export const expenseIdParamsSchema = z.object({
  id: z.string().uuid('Invalid expense ID'),
});

export const expenseQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  status: z.enum(expenseStatuses).optional(),
  search: z.string().optional(),
  vehicle_id: z.string().uuid().optional(),
  expense_category_id: z.string().uuid().optional(),
  payment_mode_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});
