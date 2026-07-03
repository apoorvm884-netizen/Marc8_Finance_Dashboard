export interface PlatformAssignment {
  id: string;
  vehicle_id: string;
  platform_id: string;
  platform_category_id: string | null;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'ended';
  notes: string | null;
  vehicle_number: string | null;
  vehicle_name: string | null;
  platform_name: string | null;
  category_name: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateAssignmentDTO {
  vehicle_id: string;
  platform_id: string;
  platform_category_id?: string | null;
  start_date: string;
  end_date?: string | null;
  notes?: string | null;
}

export interface EndAssignmentDTO {
  end_date: string;
  notes?: string | null;
}

export interface AssignmentQueryParams {
  page?: number;
  limit?: number;
  vehicle_id?: string;
  platform_id?: string;
  status?: 'active' | 'ended';
}
