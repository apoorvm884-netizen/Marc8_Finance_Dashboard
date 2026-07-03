import { z } from 'zod';

export const activityQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  action: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export const activityEntityParamsSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required').max(50),
  entityId: z.string().uuid('Entity ID must be a valid UUID'),
});
