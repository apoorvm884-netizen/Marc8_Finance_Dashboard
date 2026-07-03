export interface Vendor {
  id: string;
  vendor_type_id: string | null;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  gst: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  rating: number | null;
  supported_services: string | null;
  payment_terms: string | null;
  is_active: boolean;
  vendor_type_name: string | null;
  vendor_type_color: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface CreateVendorDTO {
  vendor_type_id?: string | null;
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  gst?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  rating?: number | null;
  supported_services?: string | null;
  payment_terms?: string | null;
  is_active?: boolean;
}

export interface UpdateVendorDTO {
  vendor_type_id?: string | null;
  name?: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  gst?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  rating?: number | null;
  supported_services?: string | null;
  payment_terms?: string | null;
  is_active?: boolean;
}

export interface VendorQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  vendor_type_id?: string;
  is_active?: string;
}
