import { z } from 'zod';

export const createScheduleSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID'),
  service_type: z.string().min(1).max(100),
  interval_km: z.number().int().positive().optional().nullable(),
  interval_days: z.number().int().positive().optional().nullable(),
  last_service_km: z.number().int().positive().optional().nullable(),
  last_service_date: z.string().optional().nullable(),
  is_recurring: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export const updateScheduleSchema = z.object({
  service_type: z.string().min(1).max(100).optional(),
  interval_km: z.number().int().positive().optional().nullable(),
  interval_days: z.number().int().positive().optional().nullable(),
  last_service_km: z.number().int().positive().optional().nullable(),
  last_service_date: z.string().optional().nullable(),
  next_service_km: z.number().int().positive().optional().nullable(),
  next_service_date: z.string().optional().nullable(),
  is_recurring: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const scheduleIdParamsSchema = z.object({
  id: z.string().uuid('Invalid schedule ID'),
});

export const scheduleQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  vehicle_id: z.string().uuid().optional(),
  status: z.string().optional(),
  include_deleted: z.string().optional(),
});
