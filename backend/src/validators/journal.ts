import { z } from 'zod';

const journalStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'] as const;

export const createJournalEntrySchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID'),
  collection_date: z.string().optional().nullable(),
  amount_collected: z.number().min(0, 'Amount collected must be 0 or greater'),
  total_amount: z.number().min(0, 'Total amount must be 0 or greater'),
  ledger_category_id: z.string().uuid('Invalid ledger category ID'),
  reference_number: z.string().max(100, 'Reference number must not exceed 100 characters').optional().nullable(),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional().nullable(),
  status: z.enum(journalStatuses).optional().default('PENDING'),
  remarks: z.string().max(2000, 'Remarks must not exceed 2000 characters').optional().nullable(),
});

export const updateJournalEntrySchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID').optional(),
  collection_date: z.string().optional().nullable(),
  amount_collected: z.number().min(0, 'Amount collected must be 0 or greater').optional(),
  total_amount: z.number().min(0, 'Total amount must be 0 or greater').optional(),
  ledger_category_id: z.string().uuid('Invalid ledger category ID').optional(),
  reference_number: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(journalStatuses).optional(),
  remarks: z.string().max(2000).optional().nullable(),
});

export const journalIdParamsSchema = z.object({
  id: z.string().uuid('Invalid journal entry ID'),
});

export const journalQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  status: z.enum(journalStatuses).optional(),
  search: z.string().optional(),
  vehicle_id: z.string().uuid().optional(),
  ledger_category_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});
