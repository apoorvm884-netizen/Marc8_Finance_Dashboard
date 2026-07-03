export interface MasterType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MasterValue {
  id: string;
  master_type_id: string;
  code: string;
  name: string;
  description: string | null;
  display_order: number;
  color: string | null;
  icon: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateMasterValueDTO {
  code: string;
  name: string;
  description?: string | null;
  display_order?: number | null;
  color?: string | null;
  icon?: string | null;
  is_active?: boolean;
}

export interface UpdateMasterValueDTO {
  code?: string;
  name?: string;
  description?: string | null;
  display_order?: number | null;
  color?: string | null;
  icon?: string | null;
  is_active?: boolean;
}
