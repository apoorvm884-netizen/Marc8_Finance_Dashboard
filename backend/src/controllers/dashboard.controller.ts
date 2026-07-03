import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { dashboardService } from '../services/financial-engine/dashboard.service';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  async getDashboardData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        date_from: req.query.date_from as string | undefined,
        date_to: req.query.date_to as string | undefined,
        vehicle_id: req.query.vehicle_id as string | undefined,
        platform_id: req.query.platform_id as string | undefined,
        expense_category_id: req.query.expense_category_id as string | undefined,
        payment_mode_id: req.query.payment_mode_id as string | undefined,
        journal_category_id: req.query.journal_category_id as string | undefined,
      };
      const data = await dashboardService.getDashboardData(filters);
      sendSuccess(res, data, 'Dashboard data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
