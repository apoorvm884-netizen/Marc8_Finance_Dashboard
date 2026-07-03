import { z } from 'zod';

export const assignmentFormSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle is required'),
  platform_id: z.string().min(1, 'Platform is required'),
  platform_category_id: z.string().optional().or(z.literal('')),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

export const endAssignmentFormSchema = z.object({
  end_date: z.string().min(1, 'End date is required'),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type EndAssignmentFormData = z.infer<typeof endAssignmentFormSchema>;
