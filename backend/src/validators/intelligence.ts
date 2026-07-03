import { z } from 'zod';

export const intelligenceQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  alert_type: z.string().optional(),
  is_dismissed: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'actioned', 'dismissed']).optional(),
  recommendation_type: z.string().optional(),
});

export const alertIdParamsSchema = z.object({
  id: z.string().uuid('Invalid alert ID'),
});

export const recommendationIdParamsSchema = z.object({
  id: z.string().uuid('Invalid recommendation ID'),
});
