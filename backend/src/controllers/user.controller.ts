import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { userService } from '../services/user.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class UserController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body, req.user?.userId);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await userService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await userService.findById(id);
      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await userService.update(id, req.body, req.user?.userId);
      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await userService.delete(id);
      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async activate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await userService.activate(id, req.user?.userId);
      sendSuccess(res, user, 'User activated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await userService.deactivate(id, req.user?.userId);
      sendSuccess(res, user, 'User deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
