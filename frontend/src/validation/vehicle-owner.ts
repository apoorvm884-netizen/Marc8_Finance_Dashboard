import { z } from 'zod';

export const vehicleOwnerFormSchema = z.object({
  owner_type: z.string().optional().or(z.literal('')),
  name: z.string().min(1, 'Owner name is required').max(255),
  contact_person: z.string().max(255).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email().max(255).optional().or(z.literal('')),
  pan: z.string().max(50).optional().or(z.literal('')),
  aadhaar: z.string().max(50).optional().or(z.literal('')),
  gst: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(2000).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  pincode: z.string().max(20).optional().or(z.literal('')),
  bank_account_number: z.string().max(100).optional().or(z.literal('')),
  bank_name: z.string().max(255).optional().or(z.literal('')),
  bank_ifsc: z.string().max(50).optional().or(z.literal('')),
  upi_id: z.string().max(255).optional().or(z.literal('')),
  emergency_contact_name: z.string().max(255).optional().or(z.literal('')),
  emergency_contact_phone: z.string().max(50).optional().or(z.literal('')),
  agreement_number: z.string().max(100).optional().or(z.literal('')),
  agreement_start_date: z.string().optional().or(z.literal('')),
  agreement_end_date: z.string().optional().or(z.literal('')),
  ownership_status: z.string().optional().or(z.literal('')),
  agreement_status: z.string().optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
  is_active: z.boolean().optional().default(true),
});

export type VehicleOwnerFormData = z.infer<typeof vehicleOwnerFormSchema>;
