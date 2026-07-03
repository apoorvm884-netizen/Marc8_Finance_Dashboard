import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { approvalService } from '../services/approval.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class ApprovalController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await approvalService.create(req.body, req.user?.userId);
      sendSuccess(res, result, 'Approval request created', 201);
    } catch (error) { next(error); }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await approvalService.findAll(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Approval requests retrieved');
    } catch (error) { next(error); }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await approvalService.findById(req.params.id);
      sendSuccess(res, result, 'Approval request retrieved');
    } catch (error) { next(error); }
  }

  async processLevel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await approvalService.processLevel(req.params.id, req.body, req.user?.userId);
      sendSuccess(res, result, 'Approval processed');
    } catch (error) { next(error); }
  }

  async getPendingForUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.user?.userId;
      const result = await approvalService.getPendingForUser(userId!);
      sendSuccess(res, result, 'Pending approvals retrieved');
    } catch (error) { next(error); }
  }
}

export const approvalController = new ApprovalController();
