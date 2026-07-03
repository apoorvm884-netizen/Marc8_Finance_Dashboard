import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { maintenanceService } from '../services/maintenance.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class MaintenanceController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await maintenanceService.create(req.body, req.user?.userId);
      sendSuccess(res, record, 'Maintenance record created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await maintenanceService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Maintenance records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const record = await maintenanceService.findById(id);
      sendSuccess(res, record, 'Maintenance record retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const record = await maintenanceService.update(id, req.body, req.user?.userId);
      sendSuccess(res, record, 'Maintenance record updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await maintenanceService.delete(id, req.user?.userId);
      sendSuccess(res, null, 'Maintenance record deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const record = await maintenanceService.restore(id, req.user?.userId);
      sendSuccess(res, record, 'Maintenance record restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async getVehicleMaintenance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.params.vehicleId as string;
      const result = await maintenanceService.getVehicleMaintenance(vehicleId);
      sendSuccess(res, result, 'Vehicle maintenance history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFleetHealth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const health = await maintenanceService.getFleetHealth();
      sendSuccess(res, health, 'Fleet health retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const maintenanceController = new MaintenanceController();
