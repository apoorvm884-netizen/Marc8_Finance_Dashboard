import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { journalService } from '../services/journal.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class JournalController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const entry = await journalService.create(req.body, req.user?.userId);
      sendSuccess(res, entry, 'Journal entry created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await journalService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Journal entries retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const entry = await journalService.findById(id);
      sendSuccess(res, entry, 'Journal entry retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const entry = await journalService.update(id, req.body, req.user?.userId);
      sendSuccess(res, entry, 'Journal entry updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await journalService.delete(id, req.user?.userId);
      sendSuccess(res, null, 'Journal entry deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const entry = await journalService.restore(id, req.user?.userId);
      sendSuccess(res, entry, 'Journal entry restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const entry = await journalService.duplicate(id, req.user?.userId);
      sendSuccess(res, entry, 'Journal entry duplicated successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMetrics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await journalService.getMetrics();
      sendSuccess(res, metrics, 'Journal metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const journalController = new JournalController();
