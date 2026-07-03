import { Router } from 'express';
import { journalController } from '../controllers/journal.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
  journalIdParamsSchema,
  journalQuerySchema,
} from '../validators/journal';

const router = Router();

router.use(authenticate);

router.get(
  '/metrics',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  journalController.getMetrics.bind(journalController)
);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(journalQuerySchema),
  journalController.findAll.bind(journalController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(journalIdParamsSchema),
  journalController.findById.bind(journalController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  validate(createJournalEntrySchema),
  auditLog('CREATE', 'journal_entry'),
  journalController.create.bind(journalController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(journalIdParamsSchema),
  validate(updateJournalEntrySchema),
  auditLog('UPDATE', 'journal_entry'),
  journalController.update.bind(journalController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(journalIdParamsSchema),
  auditLog('DELETE', 'journal_entry'),
  journalController.delete.bind(journalController)
);

router.post(
  '/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(journalIdParamsSchema),
  auditLog('RESTORE', 'journal_entry'),
  journalController.restore.bind(journalController)
);

router.post(
  '/:id/duplicate',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(journalIdParamsSchema),
  auditLog('CREATE', 'journal_entry'),
  journalController.duplicate.bind(journalController)
);

export default router;
