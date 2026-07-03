import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { workflowService } from '../services/workflow.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class WorkflowController {
  async createDefinition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await workflowService.createDefinition(req.body, req.user?.userId);
      sendSuccess(res, result, 'Workflow definition created', 201);
    } catch (error) { next(error); }
  }

  async findAllDefinitions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await workflowService.findAllDefinitions(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Workflow definitions retrieved');
    } catch (error) { next(error); }
  }

  async findDefinitionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await workflowService.findDefinitionById(req.params.id);
      sendSuccess(res, result, 'Workflow definition retrieved');
    } catch (error) { next(error); }
  }

  async updateDefinition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await workflowService.updateDefinition(req.params.id, req.body, req.user?.userId);
      sendSuccess(res, result, 'Workflow definition updated');
    } catch (error) { next(error); }
  }

  async deleteDefinition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await workflowService.deleteDefinition(req.params.id);
      sendSuccess(res, null, 'Workflow definition deleted');
    } catch (error) { next(error); }
  }

  async transition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.params;
      const result = await workflowService.transition(entityType, entityId, req.body, req.user?.userId);
      sendSuccess(res, result, 'Workflow transition completed');
    } catch (error) { next(error); }
  }

  async getInstanceHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.params;
      const result = await workflowService.getInstanceHistory(entityType, entityId);
      sendSuccess(res, result, 'Workflow history retrieved');
    } catch (error) { next(error); }
  }

  async getActiveInstances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await workflowService.getActiveInstances(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Active instances retrieved');
    } catch (error) { next(error); }
  }
}

export const workflowController = new WorkflowController();
