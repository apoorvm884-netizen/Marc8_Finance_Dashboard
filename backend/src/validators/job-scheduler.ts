import { z } from 'zod';

export const createScheduledJobSchema = z.object({
  name: z.string().min(1).max(255),
  automation_rule_id: z.string().uuid().optional(),
  job_type: z.string().min(1).max(100),
  schedule_type: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  cron_expression: z.string().max(100).optional(),
  schedule_config: z.record(z.unknown()).optional(),
  is_active: z.boolean().optional().default(true),
  retry_on_failure: z.boolean().optional().default(true),
  max_retries: z.number().int().min(0).optional().default(3),
});

export const updateScheduledJobSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  automation_rule_id: z.string().uuid().optional().nullable(),
  schedule_type: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']).optional(),
  cron_expression: z.string().max(100).optional().nullable(),
  schedule_config: z.record(z.unknown()).optional().nullable(),
  is_active: z.boolean().optional(),
  retry_on_failure: z.boolean().optional(),
  max_retries: z.number().int().min(0).optional(),
});

export const scheduledJobIdParamsSchema = z.object({
  id: z.string().uuid('Invalid job ID'),
});

export const scheduledJobQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  job_type: z.string().optional(),
  is_active: z.string().optional(),
});
