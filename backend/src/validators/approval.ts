import { z } from 'zod';

const approvalLevelSchema = z.object({
  level_number: z.number().int().min(1),
  required_roles: z.array(z.string()).optional(),
  required_users: z.array(z.string().uuid()).optional(),
});

export const createApprovalRequestSchema = z.object({
  entity_type: z.string().min(1).max(100),
  entity_id: z.string().uuid('Invalid entity ID'),
  request_type: z.string().min(1).max(100),
  levels: z.array(approvalLevelSchema).min(1),
  metadata: z.record(z.unknown()).optional(),
});

export const approveRejectSchema = z.object({
  action: z.enum(['approved', 'rejected']),
  comment: z.string().optional(),
});

export const approvalRequestIdParamsSchema = z.object({
  id: z.string().uuid('Invalid approval request ID'),
});

export const approvalQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  entity_type: z.string().optional(),
});
