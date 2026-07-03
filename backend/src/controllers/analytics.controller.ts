import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { analyticsService } from '../services/financial-engine/analytics.service';
import { sendSuccess } from '../utils/response';

export class AnalyticsController {
  async getRevenueAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        date_from: req.query.date_from as string | undefined,
        date_to: req.query.date_to as string | undefined,
        vehicle_id: req.query.vehicle_id as string | undefined,
        platform_id: req.query.platform_id as string | undefined,
      };
      const data = await analyticsService.getRevenueAnalytics(filters);
      sendSuccess(res, data, 'Revenue analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getExpenseAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        date_from: req.query.date_from as string | undefined,
        date_to: req.query.date_to as string | undefined,
        expense_category_id: req.query.expense_category_id as string | undefined,
        payment_mode_id: req.query.payment_mode_id as string | undefined,
      };
      const data = await analyticsService.getExpenseAnalytics(filters);
      sendSuccess(res, data, 'Expense analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getProfitAnalytics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getProfitAnalytics();
      sendSuccess(res, data, 'Profit analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getVehiclePerformance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters = { vehicle_id: req.query.vehicle_id as string | undefined };
      const data = await analyticsService.getVehiclePerformance(filters);
      sendSuccess(res, data, 'Vehicle performance retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getPlatformComparison(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getPlatformComparison();
      sendSuccess(res, data, 'Platform comparison retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getExpenseCategoryBreakdown(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getExpenseCategoryBreakdown();
      sendSuccess(res, data, 'Expense category breakdown retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getCombinedAnalytics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const [revenue, expense, profit, vehicle, platform, cashFlow, repVsExpVsProfit, growth] = await Promise.all([
        analyticsService.getRevenueAnalytics(),
        analyticsService.getExpenseAnalytics(),
        analyticsService.getProfitAnalytics(),
        analyticsService.getVehiclePerformance(),
        analyticsService.getPlatformComparison(),
        analyticsService.getCashFlowAnalytics(),
        analyticsService.getRevenueVsExpenseVsProfit(),
        analyticsService.getMonthlyGrowth(),
      ]);
      sendSuccess(res, {
        revenue,
        expense,
        profit,
        vehicle_performance: vehicle,
        platform_comparison: platform,
        cash_flow: cashFlow,
        revenue_vs_expense_vs_profit: repVsExpVsProfit,
        growth,
      }, 'Combined analytics retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
