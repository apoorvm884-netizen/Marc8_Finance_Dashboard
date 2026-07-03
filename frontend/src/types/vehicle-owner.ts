export type OwnerType = 'company_owned' | 'client_owned' | 'partner_owned' | 'investor_owned';
export type OwnershipStatus = 'active' | 'suspended' | 'inactive';
export type AgreementStatus = 'active' | 'expired' | 'terminated' | 'renewed';
export type OwnerDocumentStatus = 'active' | 'expired' | 'expiring_soon';
export type DocType = 'agreement' | 'pan' | 'aadhaar' | 'gst_certificate' | 'cancelled_cheque' | 'rc_copy' | 'insurance_copy' | 'other';
export type OwnershipEventType = 'owner_assigned' | 'owner_changed' | 'agreement_renewed' | 'ownership_transferred' | 'ownership_suspended' | 'ownership_reactivated' | 'ownership_ended';

export interface VehicleOwner {
  id: string;
  owner_type: OwnerType;
  name: string;
  contact_person: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  pan: string | null;
  aadhaar: string | null;
  gst: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  bank_ifsc: string | null;
  upi_id: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  agreement_number: string | null;
  agreement_start_date: string | null;
  agreement_end_date: string | null;
  ownership_status: OwnershipStatus;
  agreement_status: AgreementStatus;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  linked_vehicles?: { id: string; vehicle_number: string; vehicle_name: string }[];
}

export interface CreateVehicleOwnerDTO {
  owner_type?: OwnerType;
  name: string;
  contact_person?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  pan?: string | null;
  aadhaar?: string | null;
  gst?: string | null;
  bank_account_number?: string | null;
  bank_name?: string | null;
  bank_ifsc?: string | null;
  upi_id?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  agreement_number?: string | null;
  agreement_start_date?: string | null;
  agreement_end_date?: string | null;
  ownership_status?: OwnershipStatus;
  agreement_status?: AgreementStatus;
  notes?: string | null;
  is_active?: boolean;
}

export interface UpdateVehicleOwnerDTO {
  owner_type?: OwnerType;
  name?: string;
  contact_person?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  pan?: string | null;
  aadhaar?: string | null;
  gst?: string | null;
  bank_account_number?: string | null;
  bank_name?: string | null;
  bank_ifsc?: string | null;
  upi_id?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  agreement_number?: string | null;
  agreement_start_date?: string | null;
  agreement_end_date?: string | null;
  ownership_status?: OwnershipStatus;
  agreement_status?: AgreementStatus;
  notes?: string | null;
  is_active?: boolean;
}

export interface VehicleOwnerQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  owner_type?: OwnerType;
  ownership_status?: OwnershipStatus;
  agreement_status?: AgreementStatus;
  is_active?: string;
  include_deleted?: string;
}

export interface OwnerDocument {
  id: string;
  owner_id: string;
  document_type: DocType;
  document_name: string;
  file_url: string | null;
  expiry_date: string | null;
  status: OwnerDocumentStatus;
  version: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateOwnerDocumentDTO {
  document_type: DocType;
  document_name: string;
  file_url?: string | null;
  expiry_date?: string | null;
  status?: OwnerDocumentStatus;
  notes?: string | null;
}

export interface OwnershipHistory {
  id: string;
  vehicle_id: string;
  owner_id: string | null;
  event_type: OwnershipEventType;
  event_date: string;
  previous_owner_name: string | null;
  new_owner_name: string | null;
  previous_agreement_number: string | null;
  new_agreement_number: string | null;
  previous_status: string | null;
  new_status: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  created_by: string | null;
}

export interface AssignOwnerDTO {
  vehicle_id: string;
  notes?: string | null;
}
