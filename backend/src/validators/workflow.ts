import { z } from 'zod';

const stateDefSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  is_terminal: z.boolean().optional(),
  color: z.string().optional(),
});

const transitionDefSchema = z.object({
  from_state: z.string().min(1),
  to_state: z.string().min(1),
  action: z.string().min(1),
  label: z.string().min(1),
  required_role: z.string().optional(),
  requires_approval: z.boolean().optional(),
});

export const createWorkflowDefinitionSchema = z.object({
  entity_type: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  states: z.array(stateDefSchema).min(1),
  transitions: z.array(transitionDefSchema).min(1),
});

export const updateWorkflowDefinitionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  states: z.array(stateDefSchema).min(1).optional(),
  transitions: z.array(transitionDefSchema).min(1).optional(),
  is_active: z.boolean().optional(),
});

export const transitionWorkflowSchema = z.object({
  action: z.string().min(1),
  comment: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const workflowIdParamsSchema = z.object({
  id: z.string().uuid('Invalid workflow ID'),
});

export const workflowInstanceIdParamsSchema = z.object({
  id: z.string().uuid('Invalid workflow instance ID'),
});

export const workflowQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  entity_type: z.string().optional(),
  search: z.string().optional(),
});
