import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { vendorService } from '../services/vendor.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class VendorController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vendor = await vendorService.create(req.body, req.user?.userId);
      sendSuccess(res, vendor, 'Vendor created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await vendorService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Vendors retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const vendor = await vendorService.findById(id);
      sendSuccess(res, vendor, 'Vendor retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const vendor = await vendorService.update(id, req.body, req.user?.userId);
      sendSuccess(res, vendor, 'Vendor updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await vendorService.delete(id, req.user?.userId);
      sendSuccess(res, null, 'Vendor deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const vendor = await vendorService.restore(id, req.user?.userId);
      sendSuccess(res, vendor, 'Vendor restored successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const vendorController = new VendorController();
