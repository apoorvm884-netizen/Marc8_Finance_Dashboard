import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { reportsService } from '../services/report.service';
import { exportService } from '../services/export.service';
import { sendSuccess } from '../utils/response';
import { ForbiddenError } from '../utils/errors';

export class ReportController {
  private checkProfitLossAccess(req: AuthenticatedRequest, reportType: string): void {
    if (reportType === 'profit_loss' && req.user?.restrictions && (req.user.restrictions as Record<string, unknown>).no_global_pnl === true) {
      throw new ForbiddenError('Access denied: P&L report is restricted for your role');
    }
  }

  async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { report_type, filters } = req.body;
      this.checkProfitLossAccess(req, report_type);
      const result = await reportsService.generateReport(report_type, filters || {}, req.user?.userId);
      sendSuccess(res, result, 'Report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getReportByType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reportType = req.params.type as any;
      this.checkProfitLossAccess(req, reportType);
      const filters = {
        date_from: req.query.date_from as string | undefined,
        date_to: req.query.date_to as string | undefined,
        vehicle_id: req.query.vehicle_id as string | undefined,
        platform_id: req.query.platform_id as string | undefined,
        expense_category_id: req.query.expense_category_id as string | undefined,
        payment_mode_id: req.query.payment_mode_id as string | undefined,
        journal_category_id: req.query.journal_category_id as string | undefined,
        status: req.query.status as string | undefined,
      };
      const result = await reportsService.generateReport(reportType, filters, req.user?.userId);
      sendSuccess(res, result, 'Report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { report_type, filters } = req.body;
      this.checkProfitLossAccess(req, report_type);
      const { data, filename } = await exportService.exportCSV(report_type, filters || {});
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(data);
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { report_type, filters } = req.body;
      const { data, filename } = await exportService.exportExcel(report_type, filters || {});
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(data);
    } catch (error) {
      next(error);
    }
  }

  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const templates = await reportsService.getTemplates(req.user!.userId);
      sendSuccess(res, templates, 'Templates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const template = await reportsService.createTemplate(req.body, req.user!.userId);
      sendSuccess(res, template, 'Template created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const template = await reportsService.updateTemplate(id, req.body, req.user!.userId);
      sendSuccess(res, template, 'Template updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await reportsService.deleteTemplate(id, req.user!.userId);
      sendSuccess(res, null, 'Template deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const history = await reportsService.getHistory(req.user!.userId);
      sendSuccess(res, history, 'History retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
