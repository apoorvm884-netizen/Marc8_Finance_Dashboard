import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { vehicleOwnerService } from '../services/vehicle-owner.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class VehicleOwnerController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const owner = await vehicleOwnerService.create(req.body, req.user?.userId);
      sendSuccess(res, owner, 'Vehicle owner created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await vehicleOwnerService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Vehicle owners retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const owner = await vehicleOwnerService.findById(id);
      sendSuccess(res, owner, 'Vehicle owner retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const owner = await vehicleOwnerService.update(id, req.body, req.user?.userId);
      sendSuccess(res, owner, 'Vehicle owner updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await vehicleOwnerService.delete(id, req.user?.userId);
      sendSuccess(res, null, 'Vehicle owner deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const owner = await vehicleOwnerService.restore(id, req.user?.userId);
      sendSuccess(res, owner, 'Vehicle owner restored successfully');
    } catch (error) {
      next(error);
    }
  }

  // Owner → Vehicle assignment
  async assignToVehicle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.params.id as string;
      const { vehicle_id, notes } = req.body;
      const result = await vehicleOwnerService.assignOwner(vehicle_id, ownerId, notes, req.user?.userId);
      sendSuccess(res, result, 'Owner assigned to vehicle successfully');
    } catch (error) {
      next(error);
    }
  }

  async unassignFromVehicle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { vehicle_id, notes } = req.body;
      const result = await vehicleOwnerService.assignOwner(vehicle_id, null, notes, req.user?.userId);
      sendSuccess(res, result, 'Owner unassigned from vehicle successfully');
    } catch (error) {
      next(error);
    }
  }

  async getVehicleOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.params.vehicleId as string;
      const owner = await vehicleOwnerService.getVehicleOwner(vehicleId);
      sendSuccess(res, owner, 'Vehicle owner retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getOwnerVehicles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const vehicles = await vehicleOwnerService.getOwnerVehicles(id);
      sendSuccess(res, vehicles, 'Owner vehicles retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Ownership history
  async getOwnershipHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.params.vehicleId as string;
      const history = await vehicleOwnerService.getOwnershipHistory(vehicleId);
      sendSuccess(res, history, 'Ownership history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Documents
  async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.params.id as string;
      const docs = await vehicleOwnerService.getOwnerDocuments(ownerId);
      sendSuccess(res, docs, 'Owner documents retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async addDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.params.id as string;
      const doc = await vehicleOwnerService.addDocument(ownerId, req.body, req.user?.userId);
      sendSuccess(res, doc, 'Document added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.params.id as string;
      const docId = req.params.docId as string;
      const doc = await vehicleOwnerService.updateDocument(ownerId, docId, req.body, req.user?.userId);
      sendSuccess(res, doc, 'Document updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.params.id as string;
      const docId = req.params.docId as string;
      await vehicleOwnerService.deleteDocument(ownerId, docId);
      sendSuccess(res, null, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const vehicleOwnerController = new VehicleOwnerController();
