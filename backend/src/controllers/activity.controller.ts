import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { activityService } from '../services/activity.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class ActivityController {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await activityService.findAll(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Activity log retrieved');
    } catch (error) { next(error); }
  }

  async findByEntity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.params;
      const result = await activityService.findByEntity(entityType, entityId, req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Activity log retrieved');
    } catch (error) { next(error); }
  }
}

export const activityController = new ActivityController();
