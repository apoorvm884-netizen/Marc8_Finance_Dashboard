import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { slaService } from '../services/sla.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class SLAController {
  async createDefinition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await slaService.createDefinition(req.body);
      sendSuccess(res, result, 'SLA definition created', 201);
    } catch (error) { next(error); }
  }

  async findAllDefinitions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await slaService.findAllDefinitions(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'SLA definitions retrieved');
    } catch (error) { next(error); }
  }

  async findDefinitionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await slaService.findDefinitionById(req.params.id);
      sendSuccess(res, result, 'SLA definition retrieved');
    } catch (error) { next(error); }
  }

  async updateDefinition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await slaService.updateDefinition(req.params.id, req.body);
      sendSuccess(res, result, 'SLA definition updated');
    } catch (error) { next(error); }
  }

  async deleteDefinition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await slaService.deleteDefinition(req.params.id);
      sendSuccess(res, null, 'SLA definition deleted');
    } catch (error) { next(error); }
  }

  async checkBreaches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await slaService.checkBreaches();
      sendSuccess(res, result, 'SLA breaches checked');
    } catch (error) { next(error); }
  }

  async getBreaches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await slaService.getBreaches(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'SLA breaches retrieved');
    } catch (error) { next(error); }
  }
}

export const slaController = new SLAController();
