import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import { createTaskSchema, updateTaskSchema, createTaskCommentSchema, taskIdParamsSchema, taskQuerySchema } from '../validators/task';

const router = Router();
router.use(authenticate);

router.get(
  '/summary',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  taskController.getSummary.bind(taskController)
);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(taskQuerySchema),
  taskController.findAll.bind(taskController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(taskIdParamsSchema),
  taskController.findById.bind(taskController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(createTaskSchema),
  auditLog('CREATE', 'task'),
  taskController.create.bind(taskController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(taskIdParamsSchema),
  validate(updateTaskSchema),
  auditLog('UPDATE', 'task'),
  taskController.update.bind(taskController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(taskIdParamsSchema),
  auditLog('DELETE', 'task'),
  taskController.delete.bind(taskController)
);

router.get(
  '/:id/comments',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(taskIdParamsSchema),
  taskController.getComments.bind(taskController)
);

router.post(
  '/:id/comments',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  validateParams(taskIdParamsSchema),
  validate(createTaskCommentSchema),
  taskController.addComment.bind(taskController)
);

export default router;
