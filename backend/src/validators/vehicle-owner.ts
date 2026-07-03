import { z } from 'zod';

const ownerTypes = ['company_owned', 'client_owned', 'partner_owned', 'investor_owned'] as const;
const ownershipStatuses = ['active', 'suspended', 'inactive'] as const;
const agreementStatuses = ['active', 'expired', 'terminated', 'renewed'] as const;
const docTypes = ['agreement', 'pan', 'aadhaar', 'gst_certificate', 'cancelled_cheque', 'rc_copy', 'insurance_copy', 'other'] as const;
const docStatuses = ['active', 'expired', 'expiring_soon'] as const;

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateOrEmpty = () => z.string().regex(dateRegex, 'Invalid date format (YYYY-MM-DD)').optional().nullable();

export const createVehicleOwnerSchema = z.object({
  owner_type: z.enum(ownerTypes).optional().default('client_owned'),
  name: z.string().min(1, 'Owner name is required').max(255),
  contact_person: z.string().max(255).optional().nullable(),
  address: z.string().max(2000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(20).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal('')),
  pan: z.string().max(50).optional().nullable(),
  aadhaar: z.string().max(50).optional().nullable(),
  gst: z.string().max(50).optional().nullable(),
  bank_account_number: z.string().max(100).optional().nullable(),
  bank_name: z.string().max(255).optional().nullable(),
  bank_ifsc: z.string().max(50).optional().nullable(),
  upi_id: z.string().max(255).optional().nullable(),
  emergency_contact_name: z.string().max(255).optional().nullable(),
  emergency_contact_phone: z.string().max(50).optional().nullable(),
  agreement_number: z.string().max(100).optional().nullable(),
  agreement_start_date: dateOrEmpty(),
  agreement_end_date: dateOrEmpty(),
  ownership_status: z.enum(ownershipStatuses).optional().default('active'),
  agreement_status: z.enum(agreementStatuses).optional().default('active'),
  notes: z.string().max(5000).optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const updateVehicleOwnerSchema = createVehicleOwnerSchema.partial();

export const vehicleOwnerIdParamsSchema = z.object({
  id: z.string().uuid('Invalid owner ID'),
});

export const vehicleOwnerQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  owner_type: z.enum(ownerTypes).optional(),
  ownership_status: z.enum(ownershipStatuses).optional(),
  agreement_status: z.enum(agreementStatuses).optional(),
  is_active: z.string().optional(),
  include_deleted: z.string().optional(),
});

export const vehicleIdParamsSchema = z.object({
  id: z.string().uuid('Invalid vehicle ID'),
});

// Owner document schemas
export const createOwnerDocumentSchema = z.object({
  document_type: z.enum(docTypes),
  document_name: z.string().min(1, 'Document name is required').max(255),
  file_url: z.string().max(500).optional().nullable(),
  expiry_date: dateOrEmpty(),
  status: z.enum(docStatuses).optional().default('active'),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateOwnerDocumentSchema = z.object({
  document_type: z.enum(docTypes).optional(),
  document_name: z.string().min(1, 'Document name is required').max(255).optional(),
  file_url: z.string().max(500).optional().nullable(),
  expiry_date: dateOrEmpty(),
  status: z.enum(docStatuses).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const ownerDocumentIdParamsSchema = z.object({
  id: z.string().uuid('Invalid document ID'),
  ownerId: z.string().uuid('Invalid owner ID'),
});

// Ownership history schemas
const eventTypes = ['owner_assigned', 'owner_changed', 'agreement_renewed', 'ownership_transferred', 'ownership_suspended', 'ownership_reactivated', 'ownership_ended'] as const;

export const createOwnershipHistorySchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID'),
  owner_id: z.string().uuid().optional().nullable(),
  event_type: z.enum(eventTypes),
  event_date: z.string().optional(),
  previous_owner_name: z.string().max(255).optional().nullable(),
  new_owner_name: z.string().max(255).optional().nullable(),
  previous_agreement_number: z.string().max(100).optional().nullable(),
  new_agreement_number: z.string().max(100).optional().nullable(),
  previous_status: z.string().max(30).optional().nullable(),
  new_status: z.string().max(30).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

// Vehicle owner assignment schema
export const assignOwnerToVehicleSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID'),
  owner_id: z.string().uuid('Invalid owner ID').nullable(),
  notes: z.string().max(5000).optional().nullable(),
});
