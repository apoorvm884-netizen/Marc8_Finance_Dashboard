import { z } from 'zod';

export const createEscalationRuleSchema = z.object({
  sla_definition_id: z.string().uuid().optional(),
  entity_type: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  trigger_after_minutes: z.number().int().min(1),
  escalate_to_role: z.string().optional(),
  escalate_to_user: z.string().uuid().optional(),
  notify: z.boolean().optional().default(true),
});

export const updateEscalationRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  trigger_after_minutes: z.number().int().min(1).optional(),
  escalate_to_role: z.string().optional().nullable(),
  escalate_to_user: z.string().uuid().optional().nullable(),
  notify: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const escalationRuleIdParamsSchema = z.object({
  id: z.string().uuid('Invalid escalation rule ID'),
});

export const escalationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  entity_type: z.string().optional(),
  is_active: z.string().optional(),
});
