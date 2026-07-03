import { z } from 'zod';

export const createAssignmentSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID'),
  platform_id: z.string().uuid('Invalid platform ID'),
  platform_category_id: z.string().uuid().optional().nullable(),
  start_date: z.string().min(1, 'Start date required'),
  end_date: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const endAssignmentSchema = z.object({
  end_date: z.string().min(1, 'End date required'),
  notes: z.string().max(2000).optional().nullable(),
});

export const assignmentIdParamsSchema = z.object({
  id: z.string().uuid('Invalid assignment ID'),
});

export const assignmentQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  vehicle_id: z.string().uuid().optional(),
  platform_id: z.string().uuid().optional(),
  status: z.enum(['active', 'ended']).optional(),
});
