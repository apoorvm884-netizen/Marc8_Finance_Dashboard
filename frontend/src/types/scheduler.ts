export interface ServiceSchedule {
  id: string;
  vehicle_id: string;
  service_type: string;
  interval_km: number | null;
  interval_days: number | null;
  last_service_km: number | null;
  last_service_date: string | null;
  next_service_km: number | null;
  next_service_date: string | null;
  is_recurring: boolean;
  notes: string | null;
  status: 'active' | 'inactive';
  vehicle_number: string | null;
  vehicle_name: string | null;
  current_odometer: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateScheduleDTO {
  vehicle_id: string;
  service_type?: 'time' | 'distance' | 'both';
  interval_km?: number | null;
  interval_days?: number | null;
  last_service_km?: number | null;
  last_service_date?: string | null;
  is_recurring?: boolean;
  notes?: string | null;
}

export interface UpdateScheduleDTO {
  service_type?: 'time' | 'distance' | 'both';
  interval_km?: number | null;
  interval_days?: number | null;
  last_service_km?: number | null;
  last_service_date?: string | null;
  next_service_km?: number | null;
  next_service_date?: string | null;
  is_recurring?: boolean;
  notes?: string | null;
  status?: 'active' | 'inactive';
}

export interface ScheduleQueryParams {
  page?: number;
  limit?: number;
  vehicle_id?: string;
  status?: 'active' | 'inactive';
}

export interface UpcomingService extends ServiceSchedule {
  days_remaining: number | null;
  km_remaining: number | null;
}

export interface OverdueService extends ServiceSchedule {
  days_overdue: number | null;
  km_overdue: number | null;
}

export interface UpcomingServicesResult {
  upcoming: UpcomingService[];
  overdue: OverdueService[];
  next_7_days: number;
  next_30_days: number;
}
