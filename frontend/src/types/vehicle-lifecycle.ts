import type { PlatformAssignment } from './platform-assignment';

export interface TimelineEvent {
  id: string;
  vehicle_id: string;
  event_type: string;
  event_date: string;
  title: string;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  created_by: string | null;
}

export interface CreateTimelineEventDTO {
  event_type: string;
  event_date: string;
  title: string;
  description?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface DocumentStatus {
  date: string | null;
  status: 'valid' | 'expiring_soon' | 'expired' | 'not_set';
}

export interface VehicleIntelligence {
  vehicle: {
    id: string;
    vehicle_number: string;
    vehicle_name: string;
    status: string;
  };
  revenue: number;
  expense: number;
  outstanding: number;
  maintenance_cost: number;
  profit: number;
  margin: number;
  document_status: Record<string, DocumentStatus>;
  health_score: number;
  platform_history: PlatformAssignment[];
  service_history: TimelineEvent[];
  timeline: TimelineEvent[];
}
