export type VehicleStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'INACTIVE';
export type FuelType = 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type OwnershipType = 'OWNED' | 'LEASED' | 'RENTAL' | 'CO_HOSTED_CLIENT';

export interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_name: string;
  fleet_code: string | null;
  brand: string | null;
  model: string | null;
  variant: string | null;
  year: number | null;
  color: string | null;
  fuel_type: FuelType | null;
  transmission: Transmission | null;
  ownership_type: OwnershipType | null;
  seating_capacity: number | null;
  chassis_number: string | null;
  engine_number: string | null;
  status: VehicleStatus;
  active_platform_id: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  current_odometer: number | null;
  insurance_expiry: string | null;
  permit_expiry: string | null;
  road_tax_expiry: string | null;
  pollution_expiry: string | null;
  fitness_expiry: string | null;
  rc_expiry: string | null;
  photo: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface CreateVehicleDTO {
  vehicle_number: string;
  vehicle_name: string;
  fleet_code?: string | null;
  brand?: string | null;
  model?: string | null;
  variant?: string | null;
  year?: number | null;
  color?: string | null;
  fuel_type?: FuelType | null;
  transmission?: Transmission | null;
  ownership_type?: OwnershipType | null;
  seating_capacity?: number | null;
  chassis_number?: string | null;
  engine_number?: string | null;
  status?: VehicleStatus;
  active_platform_id?: string | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  current_odometer?: number | null;
  insurance_expiry?: string | null;
  permit_expiry?: string | null;
  road_tax_expiry?: string | null;
  pollution_expiry?: string | null;
  fitness_expiry?: string | null;
  rc_expiry?: string | null;
  photo?: string | null;
  notes?: string | null;
}

export interface UpdateVehicleDTO {
  vehicle_number?: string;
  vehicle_name?: string;
  fleet_code?: string | null;
  brand?: string | null;
  model?: string | null;
  variant?: string | null;
  year?: number | null;
  color?: string | null;
  fuel_type?: FuelType | null;
  transmission?: Transmission | null;
  ownership_type?: OwnershipType | null;
  seating_capacity?: number | null;
  chassis_number?: string | null;
  engine_number?: string | null;
  status?: VehicleStatus;
  active_platform_id?: string | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  current_odometer?: number | null;
  insurance_expiry?: string | null;
  permit_expiry?: string | null;
  road_tax_expiry?: string | null;
  pollution_expiry?: string | null;
  fitness_expiry?: string | null;
  rc_expiry?: string | null;
  photo?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface VehicleQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  status?: VehicleStatus;
  search?: string;
  fuel_type?: FuelType;
  transmission?: Transmission;
  ownership_type?: OwnershipType;
  insurance_expiring_soon?: string;
  fitness_expiring_soon?: string;
  pollution_expiring_soon?: string;
  is_active?: string;
  include_deleted?: string;
}
