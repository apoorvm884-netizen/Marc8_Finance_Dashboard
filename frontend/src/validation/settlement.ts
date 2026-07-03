import { z } from 'zod';

export const settlementFormSchema = z.object({
  period_start: z.string().min(1, 'Period start is required'),
  period_end: z.string().min(1, 'Period end is required'),
  owner_id: z.string().optional().or(z.literal('')),
  vehicle_id: z.string().optional().or(z.literal('')),
  platform_id: z.string().optional().or(z.literal('')),
  settlement_type: z.string().optional().or(z.literal('')),
  revenue_model: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type SettlementFormData = z.infer<typeof settlementFormSchema>;

export const runPipelineSchema = z.object({
  period_start: z.string().min(1, 'Period start is required'),
  period_end: z.string().min(1, 'Period end is required'),
  owner_id: z.string().optional().or(z.literal('')),
  vehicle_id: z.string().optional().or(z.literal('')),
  platform_id: z.string().optional().or(z.literal('')),
  revenue_model: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type RunPipelineFormData = z.infer<typeof runPipelineSchema>;

export const paymentFormSchema = z.object({
  payment_method: z.string().min(1, 'Payment method is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  payment_date: z.string().min(1, 'Payment date is required'),
  reference_number: z.string().optional().or(z.literal('')),
  transaction_id: z.string().optional().or(z.literal('')),
  remarks: z.string().optional().or(z.literal('')),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;
