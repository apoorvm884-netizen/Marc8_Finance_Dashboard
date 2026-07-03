import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID'),
  vendor_id: z.string().uuid().optional().nullable(),
  maintenance_type_id: z.string().uuid('Invalid maintenance type'),
  service_date: z.string().min(1, 'Service date required'),
  odometer_reading: z.number().int().optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  cost: z.number().min(0, 'Cost must be 0 or greater'),
  vendor_invoice: z.string().max(255).optional().nullable(),
  warranty_months: z.number().int().optional().nullable(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional().default('completed'),
  notes: z.string().max(5000).optional().nullable(),
  parts: z.array(z.object({
    part_category_id: z.string().uuid().optional().nullable(),
    part_name: z.string().min(1, 'Part name required').max(255),
    brand: z.string().max(255).optional().nullable(),
    vendor: z.string().max(255).optional().nullable(),
    quantity: z.number().int().min(1).default(1),
    unit_price: z.number().min(0),
    total_price: z.number().min(0).optional().nullable(),
    warranty_months: z.number().int().optional().nullable(),
    invoice_number: z.string().max(255).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
  })).optional(),
});

export const updateMaintenanceSchema = z.object({
  vendor_id: z.string().uuid().optional().nullable(),
  maintenance_type_id: z.string().uuid().optional(),
  service_date: z.string().optional(),
  odometer_reading: z.number().int().optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  cost: z.number().min(0).optional(),
  vendor_invoice: z.string().max(255).optional().nullable(),
  warranty_months: z.number().int().optional().nullable(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  notes: z.string().max(5000).optional().nullable(),
});

export const maintenanceIdParamsSchema = z.object({
  id: z.string().uuid('Invalid maintenance ID'),
});

export const maintenanceQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  vehicle_id: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  maintenance_type_id: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional(),
});
