import { z } from 'zod';

const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const;

export const maintenancePartSchema = z.object({
  part_category_id: z.string().optional().or(z.literal('')),
  part_name: z.string().min(1, 'Part name is required').max(255),
  brand: z.string().max(255).optional().or(z.literal('')),
  vendor: z.string().max(255).optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(1).default(1),
  unit_price: z.coerce.number().min(0, 'Must be 0 or greater'),
  total_price: z.coerce.number().min(0).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  warranty_months: z.coerce.number().int().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  invoice_number: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const maintenanceFormSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle is required'),
  vendor_id: z.string().optional().or(z.literal('')),
  maintenance_type_id: z.string().min(1, 'Maintenance type is required'),
  service_date: z.string().min(1, 'Service date is required'),
  odometer_reading: z.coerce.number().int().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  description: z.string().max(5000).optional().or(z.literal('')),
  cost: z.coerce.number().min(0, 'Cost must be 0 or greater'),
  vendor_invoice: z.string().max(255).optional().or(z.literal('')),
  warranty_months: z.coerce.number().int().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  status: z.enum(statuses).default('completed'),
  notes: z.string().max(5000).optional().or(z.literal('')),
  parts: z.array(maintenancePartSchema).optional().default([]),
});

export type MaintenanceFormData = z.infer<typeof maintenanceFormSchema>;
