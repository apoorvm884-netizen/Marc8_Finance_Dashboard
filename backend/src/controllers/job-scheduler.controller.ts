import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { jobSchedulerService } from '../services/job-scheduler.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class JobSchedulerController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobSchedulerService.create(req.body);
      sendSuccess(res, result, 'Scheduled job created', 201);
    } catch (error) { next(error); }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobSchedulerService.findAll(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Scheduled jobs retrieved');
    } catch (error) { next(error); }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobSchedulerService.findById(req.params.id);
      sendSuccess(res, result, 'Scheduled job retrieved');
    } catch (error) { next(error); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobSchedulerService.update(req.params.id, req.body);
      sendSuccess(res, result, 'Scheduled job updated');
    } catch (error) { next(error); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await jobSchedulerService.delete(req.params.id);
      sendSuccess(res, null, 'Scheduled job deleted');
    } catch (error) { next(error); }
  }

  async execute(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobSchedulerService.executeJob(req.params.id);
      sendSuccess(res, result, 'Job executed');
    } catch (error) { next(error); }
  }

  async getDueJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobSchedulerService.getDueJobs();
      sendSuccess(res, result, 'Due jobs retrieved');
    } catch (error) { next(error); }
  }

  async getExecutions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobSchedulerService.getExecutions(req.params.id, req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Job executions retrieved');
    } catch (error) { next(error); }
  }
}

export const jobSchedulerController = new JobSchedulerController();
