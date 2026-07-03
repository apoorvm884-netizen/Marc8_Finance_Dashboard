import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { taskService } from '../services/task.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class TaskController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.create(req.body, req.user?.userId);
      sendSuccess(res, result, 'Task created', 201);
    } catch (error) { next(error); }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.findAll(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Tasks retrieved');
    } catch (error) { next(error); }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.findById(req.params.id);
      sendSuccess(res, result, 'Task retrieved');
    } catch (error) { next(error); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.update(req.params.id, req.body, req.user?.userId);
      sendSuccess(res, result, 'Task updated');
    } catch (error) { next(error); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.params.id, req.user?.userId);
      sendSuccess(res, null, 'Task deleted');
    } catch (error) { next(error); }
  }

  async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.addComment(req.params.id, req.body, req.user?.userId);
      sendSuccess(res, result, 'Comment added', 201);
    } catch (error) { next(error); }
  }

  async getComments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.getComments(req.params.id);
      sendSuccess(res, result, 'Comments retrieved');
    } catch (error) { next(error); }
  }

  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.getTaskSummary();
      sendSuccess(res, result, 'Task summary retrieved');
    } catch (error) { next(error); }
  }
}

export const taskController = new TaskController();
