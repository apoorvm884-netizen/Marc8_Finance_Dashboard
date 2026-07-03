import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { platformAssignmentService } from '../services/platform-assignment.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class PlatformAssignmentController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const assignment = await platformAssignmentService.create(req.body, req.user?.userId);
      sendSuccess(res, assignment, 'Platform assignment created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await platformAssignmentService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Assignments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const assignment = await platformAssignmentService.findById(id);
      sendSuccess(res, assignment, 'Assignment retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async endAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const assignment = await platformAssignmentService.endAssignment(id, req.body, req.user?.userId);
      sendSuccess(res, assignment, 'Assignment ended successfully');
    } catch (error) {
      next(error);
    }
  }

  async getVehicleAssignmentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.params.vehicleId as string;
      const history = await platformAssignmentService.getVehicleAssignmentHistory(vehicleId);
      sendSuccess(res, history, 'Assignment history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const platformAssignmentController = new PlatformAssignmentController();
