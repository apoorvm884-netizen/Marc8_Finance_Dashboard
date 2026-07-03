import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { vehicleLifecycleService } from '../services/vehicle-lifecycle.service';
import { sendSuccess } from '../utils/response';

export class VehicleLifecycleController {
  async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.params.vehicleId as string;
      const timeline = await vehicleLifecycleService.getTimeline(vehicleId);
      sendSuccess(res, timeline, 'Timeline retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async addEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.params.vehicleId as string;
      const event = await vehicleLifecycleService.addEvent(
        { ...req.body, vehicle_id: vehicleId },
        req.user?.userId
      );
      sendSuccess(res, event, 'Timeline event added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getVehicleIntelligence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.params.vehicleId as string;
      const intelligence = await vehicleLifecycleService.getVehicleIntelligence(vehicleId);
      sendSuccess(res, intelligence, 'Vehicle intelligence retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const vehicleLifecycleController = new VehicleLifecycleController();
