import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { intelligenceService } from '../services/intelligence.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class IntelligenceController {
  async createAlert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await intelligenceService.createAlert({ ...req.body, created_by: req.user?.userId });
      sendSuccess(res, result, 'Alert created', 201);
    } catch (error) { next(error); }
  }

  async findAllAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await intelligenceService.findAllAlerts(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Alerts retrieved');
    } catch (error) { next(error); }
  }

  async dismissAlert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await intelligenceService.dismissAlert(req.params.id);
      sendSuccess(res, result, 'Alert dismissed');
    } catch (error) { next(error); }
  }

  async createRecommendation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await intelligenceService.createRecommendation(req.body);
      sendSuccess(res, result, 'Recommendation created', 201);
    } catch (error) { next(error); }
  }

  async findAllRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await intelligenceService.findAllRecommendations(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Recommendations retrieved');
    } catch (error) { next(error); }
  }

  async actionRecommendation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await intelligenceService.actionRecommendation(req.params.id, req.user?.userId);
      sendSuccess(res, result, 'Recommendation actioned');
    } catch (error) { next(error); }
  }

  async dismissRecommendation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await intelligenceService.dismissRecommendation(req.params.id);
      sendSuccess(res, result, 'Recommendation dismissed');
    } catch (error) { next(error); }
  }

  async generateInsights(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await intelligenceService.generateInsights();
      sendSuccess(res, result, 'Insights generated');
    } catch (error) { next(error); }
  }
}

export const intelligenceController = new IntelligenceController();
