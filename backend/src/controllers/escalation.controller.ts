import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { escalationService } from '../services/escalation.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class EscalationController {
  async createRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await escalationService.createRule(req.body);
      sendSuccess(res, result, 'Escalation rule created', 201);
    } catch (error) { next(error); }
  }

  async findAllRules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await escalationService.findAllRules(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Escalation rules retrieved');
    } catch (error) { next(error); }
  }

  async findRuleById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await escalationService.findRuleById(req.params.id);
      sendSuccess(res, result, 'Escalation rule retrieved');
    } catch (error) { next(error); }
  }

  async updateRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await escalationService.updateRule(req.params.id, req.body);
      sendSuccess(res, result, 'Escalation rule updated');
    } catch (error) { next(error); }
  }

  async deleteRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await escalationService.deleteRule(req.params.id);
      sendSuccess(res, null, 'Escalation rule deleted');
    } catch (error) { next(error); }
  }

  async triggerEscalation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await escalationService.triggerEscalation(req.params.breachId);
      sendSuccess(res, null, 'Escalation triggered');
    } catch (error) { next(error); }
  }
}

export const escalationController = new EscalationController();
