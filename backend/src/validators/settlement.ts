import { z } from 'zod';

export const settlementStatuses = [
  'draft', 'calculated', 'pending_approval', 'approved', 'rejected',
  'payment_initiated', 'paid', 'partially_paid', 'cancelled', 'closed',
] as const;

export const settlementTypes = ['owner', 'platform'] as const;

export const settlementRevenueModels = [
  'fixed_monthly', 'revenue_share_percent', 'profit_share_percent',
  'hybrid', 'minimum_guarantee', 'custom_formula',
] as const;

export const settlementPaymentMethods = [
  'bank_transfer', 'upi', 'cash', 'cheque',
] as const;

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createSettlementSchema = z.object({
  period_start: z.string().regex(dateRegex, 'Invalid date format (YYYY-MM-DD)'),
  period_end: z.string().regex(dateRegex, 'Invalid date format (YYYY-MM-DD)'),
  owner_id: z.string().uuid().optional().nullable(),
  vehicle_id: z.string().uuid().optional().nullable(),
  platform_id: z.string().uuid().optional().nullable(),
  settlement_type: z.enum(settlementTypes).optional().default('owner'),
  revenue_model: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export const updateSettlementSchema = z.object({
  period_start: z.string().regex(dateRegex).optional(),
  period_end: z.string().regex(dateRegex).optional(),
  owner_id: z.string().uuid().optional().nullable(),
  vehicle_id: z.string().uuid().optional().nullable(),
  platform_id: z.string().uuid().optional().nullable(),
  settlement_type: z.enum(settlementTypes).optional(),
  revenue_model: z.string().optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(settlementStatuses).optional(),
});

export const settlementIdParamsSchema = z.object({
  id: z.string().uuid('Invalid settlement ID'),
});

export const settlementQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  settlement_type: z.enum(settlementTypes).optional(),
  owner_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional(),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  include_deleted: z.string().optional(),
});

export const runPipelineSchema = z.object({
  period_start: z.string().regex(dateRegex, 'Invalid date format (YYYY-MM-DD)'),
  period_end: z.string().regex(dateRegex, 'Invalid date format (YYYY-MM-DD)'),
  owner_id: z.string().uuid().optional().nullable(),
  vehicle_id: z.string().uuid().optional().nullable(),
  platform_id: z.string().uuid().optional().nullable(),
  revenue_model: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export const approveSettlementSchema = z.object({
  remarks: z.string().optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: z.enum(settlementStatuses),
  remarks: z.string().optional().nullable(),
});

export const createSettlementPaymentSchema = z.object({
  payment_method: z.string().min(1, 'Payment method is required'),
  amount: z.number().positive('Amount must be positive'),
  payment_date: z.string().regex(dateRegex, 'Invalid date format (YYYY-MM-DD)'),
  reference_number: z.string().max(255).optional().nullable(),
  transaction_id: z.string().max(255).optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const settlementPaymentParamsSchema = z.object({
  id: z.string().uuid('Invalid settlement ID'),
  paymentId: z.string().uuid('Invalid payment ID'),
});

export const createSettlementDocumentSchema = z.object({
  document_name: z.string().min(1, 'Document name is required').max(255),
  file_url: z.string().max(500).optional().nullable(),
  document_type: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const settlementDocumentParamsSchema = z.object({
  id: z.string().uuid('Invalid settlement ID'),
  documentId: z.string().uuid('Invalid document ID'),
});
