import { z } from 'zod';

const expenseStatuses = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export const expenseFormSchema = z.object({
  vehicle_id: z.string().optional().or(z.literal('')),
  expense_category_id: z.string().min(1, 'Category is required'),
  payment_mode_id: z.string().min(1, 'Payment mode is required'),
  expense_date: z.string().optional().or(z.literal('')),
  amount: z.coerce.number().min(0, 'Amount must be 0 or greater').default(0),
  vendor: z.string().max(200).optional().or(z.literal('')),
  invoice_number: z.string().max(100).optional().or(z.literal('')),
  status: z.enum(expenseStatuses).default('PENDING'),
  remarks: z.string().max(2000).optional().or(z.literal('')),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
