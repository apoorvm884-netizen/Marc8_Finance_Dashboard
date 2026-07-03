import { z } from 'zod';

const outstandingStatuses = ['upcoming', 'due_today', 'overdue', 'paid', 'cancelled', 'partially_paid'] as const;
const outstandingPriorities = ['low', 'normal', 'high', 'urgent'] as const;

export const createOutstandingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  outstanding_category_id: z.string().uuid('Invalid category'),
  vehicle_id: z.string().uuid('Invalid vehicle').optional().nullable(),
  platform_id: z.string().uuid('Invalid platform').optional().nullable(),
  vendor: z.string().max(255).optional().nullable(),
  amount: z.number().min(0, 'Amount must be 0 or greater'),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(outstandingPriorities).optional().default('normal'),
  status: z.enum(outstandingStatuses).optional().default('upcoming'),
  notes: z.string().max(5000).optional().nullable(),
});

export const updateOutstandingSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  outstanding_category_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional().nullable(),
  platform_id: z.string().uuid().optional().nullable(),
  vendor: z.string().max(255).optional().nullable(),
  amount: z.number().min(0).optional(),
  due_date: z.string().optional(),
  priority: z.enum(outstandingPriorities).optional(),
  status: z.enum(outstandingStatuses).optional(),
  notes: z.string().max(5000).optional().nullable(),
});

export const markAsPaidSchema = z.object({
  payment_mode_id: z.string().uuid('Invalid payment mode'),
  expense_category_id: z.string().uuid('Invalid expense category'),
  paid_amount: z.number().min(0, 'Amount must be 0 or greater').optional(),
  paid_date: z.string().optional(),
  notes: z.string().max(5000).optional().nullable(),
});

export type CreateOutstandingFormData = z.infer<typeof createOutstandingSchema>;
export type UpdateOutstandingFormData = z.infer<typeof updateOutstandingSchema>;
export type MarkAsPaidFormData = z.infer<typeof markAsPaidSchema>;
