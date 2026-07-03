import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createBookingSchema,
  updateBookingSchema,
  bookingIdParamsSchema,
  bookingQuerySchema,
} from '../validators/booking';

const router = Router();

router.use(authenticate);

router.get(
  '/metrics',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  bookingController.getDashboardMetrics.bind(bookingController)
);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(bookingQuerySchema),
  bookingController.findAll.bind(bookingController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(bookingIdParamsSchema),
  bookingController.findById.bind(bookingController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  validate(createBookingSchema),
  auditLog('CREATE', 'booking'),
  bookingController.create.bind(bookingController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(bookingIdParamsSchema),
  validate(updateBookingSchema),
  auditLog('UPDATE', 'booking'),
  bookingController.update.bind(bookingController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(bookingIdParamsSchema),
  auditLog('DELETE', 'booking'),
  bookingController.delete.bind(bookingController)
);

router.post(
  '/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(bookingIdParamsSchema),
  auditLog('RESTORE', 'booking'),
  bookingController.restore.bind(bookingController)
);

router.post(
  '/:id/duplicate',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(bookingIdParamsSchema),
  auditLog('CREATE', 'booking'),
  bookingController.duplicate.bind(bookingController)
);

export default router;
