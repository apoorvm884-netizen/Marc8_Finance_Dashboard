import { z } from 'zod';

export const createSLADefinitionSchema = z.object({
  entity_type: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  from_status: z.string().optional().nullable(),
  to_status: z.string().min(1),
  sla_hours: z.number().int().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
});

export const updateSLADefinitionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  from_status: z.string().optional().nullable(),
  to_status: z.string().min(1).optional(),
  sla_hours: z.number().int().min(1).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  is_active: z.boolean().optional(),
});

export const slaIdParamsSchema = z.object({
  id: z.string().uuid('Invalid SLA ID'),
});

export const slaQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  entity_type: z.string().optional(),
  is_active: z.string().optional(),
});
