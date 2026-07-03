export interface MaintenancePart {
  id: string;
  maintenance_record_id: string;
  part_category_id: string | null;
  part_name: string;
  brand: string | null;
  vendor: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  warranty_months: number | null;
  invoice_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  vendor_id: string | null;
  maintenance_type_id: string;
  service_date: string;
  odometer_reading: number | null;
  description: string | null;
  cost: number;
  vendor_invoice: string | null;
  warranty_months: number | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  vehicle_number: string | null;
  vehicle_name: string | null;
  vendor_name: string | null;
  maintenance_type_name: string | null;
  maintenance_type_color: string | null;
  parts: MaintenancePart[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface CreateMaintenancePartDTO {
  part_category_id?: string | null;
  part_name: string;
  brand?: string | null;
  vendor?: string | null;
  quantity?: number;
  unit_price: number;
  total_price?: number | null;
  warranty_months?: number | null;
  invoice_number?: string | null;
  notes?: string | null;
}

export interface CreateMaintenanceDTO {
  vehicle_id: string;
  vendor_id?: string | null;
  maintenance_type_id: string;
  service_date: string;
  odometer_reading?: number | null;
  description?: string | null;
  cost: number;
  vendor_invoice?: string | null;
  warranty_months?: number | null;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string | null;
  parts?: CreateMaintenancePartDTO[];
}

export interface UpdateMaintenanceDTO {
  vendor_id?: string | null;
  maintenance_type_id?: string;
  service_date?: string;
  odometer_reading?: number | null;
  description?: string | null;
  cost?: number;
  vendor_invoice?: string | null;
  warranty_months?: number | null;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string | null;
}

export interface MaintenanceQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  vehicle_id?: string;
  vendor_id?: string;
  maintenance_type_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface VehicleMaintenanceSummary {
  records: MaintenanceRecord[];
  total_cost: number;
  count: number;
}

export interface FleetHealth {
  total_vehicles: number;
  active: number;
  inactive: number;
  in_maintenance: number;
  maintenance_due: number;
  insurance_due: number;
  permit_due: number;
  fitness_due: number;
  pollution_due: number;
  rc_due: number;
  upcoming_services: number;
  vehicles_in_maintenance: number;
  highest_maintenance_cost: number;
  lowest_maintenance_cost: number;
  vehicles_without_platform: number;
  expired_documents: number;
  health_score: number;
}
