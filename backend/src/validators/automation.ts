import { z } from 'zod';

const conditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'in', 'between']),
  value: z.unknown(),
});

const actionDefSchema = z.object({
  type: z.enum(['create_notification', 'create_task', 'create_alert', 'create_recommendation', 'trigger_workflow', 'send_email']),
  config: z.record(z.unknown()),
});

export const createAutomationRuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  event_type: z.string().max(100).optional(),
  conditions: z.array(conditionSchema).optional().default([]),
  actions: z.array(actionDefSchema).min(1),
  schedule_config: z.record(z.unknown()).optional(),
  is_active: z.boolean().optional().default(true),
  priority: z.number().int().optional().default(0),
  cooldown_minutes: z.number().int().min(0).optional().default(0),
  max_executions: z.number().int().min(0).optional().default(0),
});

export const updateAutomationRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  event_type: z.string().max(100).optional().nullable(),
  conditions: z.array(conditionSchema).optional(),
  actions: z.array(actionDefSchema).min(1).optional(),
  schedule_config: z.record(z.unknown()).optional().nullable(),
  is_active: z.boolean().optional(),
  priority: z.number().int().optional(),
  cooldown_minutes: z.number().int().min(0).optional(),
  max_executions: z.number().int().min(0).optional(),
});

export const automationRuleIdParamsSchema = z.object({
  id: z.string().uuid('Invalid rule ID'),
});

export const automationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  event_type: z.string().optional(),
  is_active: z.string().optional(),
  search: z.string().optional(),
});
