import { z } from 'zod';

export const createVendorSchema = z.object({
  vendor_type_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Name is required').max(255),
  contact_person: z.string().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal('')),
  gst: z.string().max(50).optional().nullable(),
  address: z.string().max(2000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(20).optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  supported_services: z.string().max(2000).optional().nullable(),
  payment_terms: z.string().max(2000).optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const updateVendorSchema = createVendorSchema.partial();

export const vendorIdParamsSchema = z.object({
  id: z.string().uuid('Invalid vendor ID'),
});

export const vendorQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  vendor_type_id: z.string().uuid().optional(),
  is_active: z.string().optional(),
});
