import { z } from 'zod';

export const scheduleFormSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle is required'),
  service_type: z.enum(['time', 'distance', 'both']).default('both'),
  interval_km: z.coerce.number().int().positive().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  interval_days: z.coerce.number().int().positive().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  last_service_km: z.coerce.number().int().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  last_service_date: z.string().optional().or(z.literal('')),
  is_recurring: z.boolean().default(true),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;
