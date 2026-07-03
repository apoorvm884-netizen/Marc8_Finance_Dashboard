import { z } from 'zod';

const journalStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'] as const;

export const journalFormSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle is required'),
  collection_date: z.string().optional().or(z.literal('')),
  amount_collected: z.coerce.number().min(0, 'Amount must be 0 or greater').default(0),
  total_amount: z.coerce.number().min(0, 'Total amount must be 0 or greater').default(0),
  ledger_category_id: z.string().min(1, 'Category is required'),
  reference_number: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  status: z.enum(journalStatuses).default('PENDING'),
  remarks: z.string().max(2000).optional().or(z.literal('')),
});

export type JournalFormData = z.infer<typeof journalFormSchema>;
