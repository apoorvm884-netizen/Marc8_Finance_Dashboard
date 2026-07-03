import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams } from '../middleware/validate';
import { UserRole } from '../types';
import { createUserSchema, updateUserSchema, userIdParamsSchema } from '../validators/auth';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER),
  userController.findAll.bind(userController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER),
  validateParams(userIdParamsSchema),
  userController.findById.bind(userController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(createUserSchema),
  userController.create.bind(userController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(userIdParamsSchema),
  validate(updateUserSchema),
  userController.update.bind(userController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN),
  validateParams(userIdParamsSchema),
  userController.delete.bind(userController)
);

router.patch(
  '/:id/activate',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(userIdParamsSchema),
  userController.activate.bind(userController)
);

router.patch(
  '/:id/deactivate',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(userIdParamsSchema),
  userController.deactivate.bind(userController)
);

export default router;
