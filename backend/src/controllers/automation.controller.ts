import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { automationService } from '../services/automation.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class AutomationController {
  async createRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await automationService.createRule(req.body, req.user?.userId);
      sendSuccess(res, result, 'Automation rule created', 201);
    } catch (error) { next(error); }
  }

  async findAllRules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await automationService.findAllRules(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Automation rules retrieved');
    } catch (error) { next(error); }
  }

  async findRuleById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await automationService.findRuleById(req.params.id);
      sendSuccess(res, result, 'Automation rule retrieved');
    } catch (error) { next(error); }
  }

  async updateRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await automationService.updateRule(req.params.id, req.body, req.user?.userId);
      sendSuccess(res, result, 'Automation rule updated');
    } catch (error) { next(error); }
  }

  async deleteRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await automationService.deleteRule(req.params.id);
      sendSuccess(res, null, 'Automation rule deleted');
    } catch (error) { next(error); }
  }

  async executeRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await automationService.executeRule(req.params.id, 'manual', req.body, req.user?.userId);
      sendSuccess(res, result, 'Rule executed');
    } catch (error) { next(error); }
  }

  async getExecutions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await automationService.getExecutions(req.params.id, req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Executions retrieved');
    } catch (error) { next(error); }
  }

  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await automationService.getExecutionSummary();
      sendSuccess(res, result, 'Automation summary retrieved');
    } catch (error) { next(error); }
  }

  async processEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await automationService.processEvent(req.body.event_type, {
        entity_type: req.body.entity_type,
        entity_id: req.body.entity_id,
        metadata: req.body.metadata,
      }, req.user?.userId);
      sendSuccess(res, result, 'Event processed');
    } catch (error) { next(error); }
  }
}

export const automationController = new AutomationController();
