import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { schedulerService } from '../services/scheduler.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class SchedulerController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await schedulerService.create(req.body, req.user?.userId);
      sendSuccess(res, schedule, 'Service schedule created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await schedulerService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Service schedules retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const schedule = await schedulerService.findById(id);
      sendSuccess(res, schedule, 'Service schedule retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const schedule = await schedulerService.update(id, req.body, req.user?.userId);
      sendSuccess(res, schedule, 'Service schedule updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await schedulerService.delete(id, req.user?.userId);
      sendSuccess(res, null, 'Service schedule deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingServices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await schedulerService.getUpcomingServices();
      sendSuccess(res, result, 'Upcoming services retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const schedulerController = new SchedulerController();
