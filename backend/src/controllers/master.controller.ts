import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { masterService } from '../services/master.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class MasterController {
  async getTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const types = await masterService.getMasterTypes();
      sendSuccess(res, types, 'Master types retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getValues(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const masterType = req.params.type as string;
      const query = req.query as Record<string, string | undefined>;
      const result = await masterService.getMasterValues(masterType, query);
      sendPaginated(res, result.data, result.meta, 'Master values retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getValueById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const masterType = req.params.type as string;
      const id = req.params.id as string;
      const value = await masterService.getMasterValueById(masterType, id);
      sendSuccess(res, value, 'Master value retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createValue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const masterType = req.params.type as string;
      const value = await masterService.createMasterValue(masterType, req.body, req.user?.userId);
      sendSuccess(res, value, 'Master value created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateValue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const masterType = req.params.type as string;
      const id = req.params.id as string;
      const value = await masterService.updateMasterValue(masterType, id, req.body, req.user?.userId);
      sendSuccess(res, value, 'Master value updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteValue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const masterType = req.params.type as string;
      const id = req.params.id as string;
      await masterService.deleteMasterValue(masterType, id);
      sendSuccess(res, null, 'Master value deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreValue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const masterType = req.params.type as string;
      const id = req.params.id as string;
      const value = await masterService.restoreMasterValue(masterType, id, req.user?.userId);
      sendSuccess(res, value, 'Master value restored successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const masterController = new MasterController();
