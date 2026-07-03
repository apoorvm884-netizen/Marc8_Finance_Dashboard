export type JournalStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface JournalEntry {
  id: string;
  vehicle_id: string;
  collection_date: string;
  amount_collected: number;
  total_amount: number;
  ledger_category_id: string;
  reference_number: string | null;
  description: string | null;
  remarks: string | null;
  status: JournalStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  vehicle_number?: string;
  vehicle_name?: string;
  category_name?: string;
}

export interface CreateJournalEntryDTO {
  vehicle_id: string;
  collection_date?: string | null;
  amount_collected: number;
  total_amount: number;
  ledger_category_id: string;
  reference_number?: string | null;
  description?: string | null;
  status?: JournalStatus;
  remarks?: string | null;
}

export interface UpdateJournalEntryDTO {
  vehicle_id?: string;
  collection_date?: string | null;
  amount_collected?: number;
  total_amount?: number;
  ledger_category_id?: string;
  reference_number?: string | null;
  description?: string | null;
  status?: JournalStatus;
  remarks?: string | null;
}

export interface JournalMetrics {
  todays_collections: number;
  monthly_collections: number;
  collections_by_category: { category_id: string; category_name: string; total: number }[];
  collections_by_vehicle: { vehicle_id: string; vehicle_number: string; total: number }[];
  recent_entries: JournalEntry[];
}
