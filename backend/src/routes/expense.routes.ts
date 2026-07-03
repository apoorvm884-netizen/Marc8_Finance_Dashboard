import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdParamsSchema,
  expenseQuerySchema,
} from '../validators/expense';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(expenseQuerySchema),
  expenseController.findAll.bind(expenseController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(expenseIdParamsSchema),
  expenseController.findById.bind(expenseController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  validate(createExpenseSchema),
  auditLog('CREATE', 'expense'),
  expenseController.create.bind(expenseController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(expenseIdParamsSchema),
  validate(updateExpenseSchema),
  auditLog('UPDATE', 'expense'),
  expenseController.update.bind(expenseController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(expenseIdParamsSchema),
  auditLog('DELETE', 'expense'),
  expenseController.delete.bind(expenseController)
);

router.post(
  '/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(expenseIdParamsSchema),
  auditLog('RESTORE', 'expense'),
  expenseController.restore.bind(expenseController)
);

router.post(
  '/:id/duplicate',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(expenseIdParamsSchema),
  auditLog('CREATE', 'expense'),
  expenseController.duplicate.bind(expenseController)
);

export default router;
