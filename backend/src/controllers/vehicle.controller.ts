import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { vehicleService } from '../services/vehicle.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class VehicleController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.create(req.body, req.user?.userId);
      sendSuccess(res, vehicle, 'Vehicle created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await vehicleService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Vehicles retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const vehicle = await vehicleService.findById(id);
      sendSuccess(res, vehicle, 'Vehicle retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const vehicle = await vehicleService.update(id, req.body, req.user?.userId);
      sendSuccess(res, vehicle, 'Vehicle updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await vehicleService.delete(id, req.user?.userId);
      sendSuccess(res, null, 'Vehicle deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const vehicle = await vehicleService.restore(id, req.user?.userId);
      sendSuccess(res, vehicle, 'Vehicle restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const vehicle = await vehicleService.duplicate(id, req.user?.userId);
      sendSuccess(res, vehicle, 'Vehicle duplicated successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

export const vehicleController = new VehicleController();
