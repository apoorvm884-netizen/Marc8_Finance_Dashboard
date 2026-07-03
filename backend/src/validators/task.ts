import { z } from 'zod';

export const createTaskSchema = z.object({
  entity_type: z.string().max(100).optional(),
  entity_id: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  assigned_to: z.string().uuid('Invalid user ID').optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  due_at: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  due_at: z.string().datetime().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export const createTaskCommentSchema = z.object({
  comment: z.string().min(1),
});

export const taskIdParamsSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

export const taskQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  assigned_to: z.string().optional(),
});
