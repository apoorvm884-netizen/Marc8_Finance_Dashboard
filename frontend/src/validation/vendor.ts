import { z } from 'zod';

export const vendorFormSchema = z.object({
  vendor_type_id: z.string().optional().or(z.literal('')),
  name: z.string().min(1, 'Name is required').max(255),
  contact_person: z.string().max(255).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email().max(255).optional().or(z.literal('')),
  gst: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(2000).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  pincode: z.string().max(20).optional().or(z.literal('')),
  rating: z.coerce.number().min(0).max(5).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  supported_services: z.string().max(2000).optional().or(z.literal('')),
  payment_terms: z.string().max(2000).optional().or(z.literal('')),
  is_active: z.boolean().optional().default(true),
});

export type VendorFormData = z.infer<typeof vendorFormSchema>;
