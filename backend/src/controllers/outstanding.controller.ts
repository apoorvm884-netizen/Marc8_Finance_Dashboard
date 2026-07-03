import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { outstandingService } from '../services/outstanding.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class OutstandingController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await outstandingService.create(req.body, req.user?.userId);
      sendSuccess(res, result, 'Outstanding created successfully', 201);
    } catch (error) { next(error); }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await outstandingService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Outstandings retrieved successfully');
    } catch (error) { next(error); }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await outstandingService.findById(id);
      sendSuccess(res, result, 'Outstanding retrieved successfully');
    } catch (error) { next(error); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await outstandingService.update(id, req.body, req.user?.userId);
      sendSuccess(res, result, 'Outstanding updated successfully');
    } catch (error) { next(error); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await outstandingService.delete(id, req.user?.userId);
      sendSuccess(res, null, 'Outstanding deleted successfully');
    } catch (error) { next(error); }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await outstandingService.restore(id, req.user?.userId);
      sendSuccess(res, result, 'Outstanding restored successfully');
    } catch (error) { next(error); }
  }

  async markAsPaid(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await outstandingService.markAsPaid(id, req.body, req.user?.userId);
      sendSuccess(res, result, 'Outstanding marked as paid. Expense created automatically.');
    } catch (error) { next(error); }
  }

  async getPaymentPlanner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        date_from: req.query.date_from as string | undefined,
        date_to: req.query.date_to as string | undefined,
        vehicle_id: req.query.vehicle_id as string | undefined,
      };
      const result = await outstandingService.getPaymentPlanner(filters);
      sendSuccess(res, result, 'Payment planner data retrieved successfully');
    } catch (error) { next(error); }
  }

  async getCashRequirementForecast(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await outstandingService.getCashRequirementForecast();
      sendSuccess(res, result, 'Cash requirement forecast retrieved successfully');
    } catch (error) { next(error); }
  }

  async getVehicleFinancialIntelligence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.params.id as string;
      const result = await outstandingService.getVehicleFinancialIntelligence(vehicleId);
      sendSuccess(res, result, 'Vehicle financial data retrieved successfully');
    } catch (error) { next(error); }
  }

  async getPlatformAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        date_from: req.query.date_from as string | undefined,
        date_to: req.query.date_to as string | undefined,
      };
      const result = await outstandingService.getPlatformAnalytics(filters);
      sendSuccess(res, result, 'Platform analytics retrieved successfully');
    } catch (error) { next(error); }
  }
}

export const outstandingController = new OutstandingController();
