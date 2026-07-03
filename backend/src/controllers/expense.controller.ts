import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { expenseService } from '../services/expense.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class ExpenseController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.create(req.body, req.user?.userId);
      sendSuccess(res, expense, 'Expense created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await expenseService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Expenses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const expense = await expenseService.findById(id);
      sendSuccess(res, expense, 'Expense retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const expense = await expenseService.update(id, req.body, req.user?.userId);
      sendSuccess(res, expense, 'Expense updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await expenseService.delete(id, req.user?.userId);
      sendSuccess(res, null, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const expense = await expenseService.restore(id, req.user?.userId);
      sendSuccess(res, expense, 'Expense restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const expense = await expenseService.duplicate(id, req.user?.userId);
      sendSuccess(res, expense, 'Expense duplicated successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

export const expenseController = new ExpenseController();
