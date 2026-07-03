import { api } from './api-client';
import type { SingleResponse } from '@/types/api';
import type { TimelineEvent, CreateTimelineEventDTO, VehicleIntelligence } from '@/types/vehicle-lifecycle';

export const vehicleLifecycleService = {
  async getTimeline(vehicleId: string): Promise<SingleResponse<TimelineEvent[]>> {
    return api.get<SingleResponse<TimelineEvent[]>>(`/vehicle-lifecycle/${vehicleId}/timeline`);
  },

  async addEvent(vehicleId: string, data: CreateTimelineEventDTO): Promise<SingleResponse<TimelineEvent>> {
    return api.post<SingleResponse<TimelineEvent>>(`/vehicle-lifecycle/${vehicleId}/timeline`, data);
  },

  async getVehicleIntelligence(vehicleId: string): Promise<SingleResponse<VehicleIntelligence>> {
    return api.get<SingleResponse<VehicleIntelligence>>(`/vehicle-lifecycle/${vehicleId}/intelligence`);
  },
};
