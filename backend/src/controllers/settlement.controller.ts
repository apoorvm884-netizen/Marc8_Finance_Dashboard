import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types';
import { settlementService } from '../services/settlement.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class SettlementController {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await settlementService.findAll(req.query as Record<string, string | undefined>);
      sendPaginated(res, result.data, result.meta, 'Settlements fetched successfully');
    } catch (error) { next(error); }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settlement = await settlementService.findById(req.params.id);
      sendSuccess(res, settlement, 'Settlement details fetched successfully');
    } catch (error) { next(error); }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settlement = await settlementService.create(req.body, req.user?.userId);
      sendSuccess(res, settlement, 'Settlement created successfully', 201);
    } catch (error) { next(error); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settlement = await settlementService.update(req.params.id, req.body, req.user?.userId);
      sendSuccess(res, settlement, 'Settlement updated successfully');
    } catch (error) { next(error); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await settlementService.delete(req.params.id, req.user?.userId);
      sendSuccess(res, null, 'Settlement deleted successfully');
    } catch (error) { next(error); }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settlement = await settlementService.restore(req.params.id, req.user?.userId);
      sendSuccess(res, settlement, 'Settlement restored successfully');
    } catch (error) { next(error); }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settlement = await settlementService.updateStatus(
        req.params.id, req.body.status, req.body.remarks || null, req.user?.userId,
      );
      sendSuccess(res, settlement, `Settlement status updated to ${req.body.status}`);
    } catch (error) { next(error); }
  }

  async runPipeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settlement = await settlementService.runPipeline(req.body, req.user?.userId);
      sendSuccess(res, settlement, 'Settlement pipeline executed successfully', 201);
    } catch (error) { next(error); }
  }

  async createPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payment = await settlementService.createPayment(req.params.id, req.body, req.user?.userId);
      sendSuccess(res, payment, 'Payment recorded successfully', 201);
    } catch (error) { next(error); }
  }

  async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payments = await settlementService.getPayments(req.params.id);
      sendSuccess(res, payments, 'Payments fetched successfully');
    } catch (error) { next(error); }
  }

  async deletePayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await settlementService.deletePayment(req.params.id, req.params.paymentId);
      sendSuccess(res, null, 'Payment deleted successfully');
    } catch (error) { next(error); }
  }

  async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const documents = await settlementService.getDocuments(req.params.id);
      sendSuccess(res, documents, 'Documents fetched successfully');
    } catch (error) { next(error); }
  }

  async addDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const doc = await settlementService.addDocument(req.params.id, req.body, req.user?.userId);
      sendSuccess(res, doc, 'Document added successfully', 201);
    } catch (error) { next(error); }
  }

  async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await settlementService.deleteDocument(req.params.id, req.params.documentId);
      sendSuccess(res, null, 'Document deleted successfully');
    } catch (error) { next(error); }
  }

  async approve(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settlement = await settlementService.updateStatus(
        req.params.id, 'approved', req.body.remarks || null, req.user?.userId,
      );
      sendSuccess(res, settlement, 'Settlement approved successfully');
    } catch (error) { next(error); }
  }

  async getDashboardMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await settlementService.getDashboardMetrics();
      sendSuccess(res, metrics, 'Settlement dashboard metrics fetched successfully');
    } catch (error) { next(error); }
  }
}

export const settlementController = new SettlementController();
