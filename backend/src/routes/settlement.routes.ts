import { Router } from 'express';
import { settlementController } from '../controllers/settlement.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateQuery, validateParams } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createSettlementSchema, updateSettlementSchema, settlementIdParamsSchema,
  settlementQuerySchema, runPipelineSchema, approveSettlementSchema, updateStatusSchema,
  createSettlementPaymentSchema, settlementPaymentParamsSchema,
  createSettlementDocumentSchema, settlementDocumentParamsSchema,
} from '../validators/settlement';

const router = Router();

router.use(authenticate);

router.get(
  '/dashboard/metrics',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  settlementController.getDashboardMetrics.bind(settlementController),
);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(settlementQuerySchema),
  settlementController.findAll.bind(settlementController),
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(settlementIdParamsSchema),
  settlementController.findById.bind(settlementController),
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(createSettlementSchema),
  auditLog('CREATE', 'settlement'),
  settlementController.create.bind(settlementController),
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(settlementIdParamsSchema),
  validate(updateSettlementSchema),
  auditLog('UPDATE', 'settlement'),
  settlementController.update.bind(settlementController),
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(settlementIdParamsSchema),
  auditLog('DELETE', 'settlement'),
  settlementController.delete.bind(settlementController),
);

router.post(
  '/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(settlementIdParamsSchema),
  auditLog('RESTORE', 'settlement'),
  settlementController.restore.bind(settlementController),
);

router.post(
  '/pipeline/run',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(runPipelineSchema),
  auditLog('CREATE', 'settlement_pipeline'),
  settlementController.runPipeline.bind(settlementController),
);

router.post(
  '/:id/status',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(settlementIdParamsSchema),
  validate(updateStatusSchema),
  auditLog('UPDATE', 'settlement_status'),
  settlementController.updateStatus.bind(settlementController),
);

router.post(
  '/:id/approve',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(settlementIdParamsSchema),
  validate(approveSettlementSchema),
  auditLog('UPDATE', 'settlement_approval'),
  settlementController.approve.bind(settlementController),
);

router.get(
  '/:id/payments',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  validateParams(settlementIdParamsSchema),
  settlementController.getPayments.bind(settlementController),
);

router.post(
  '/:id/payments',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(settlementIdParamsSchema),
  validate(createSettlementPaymentSchema),
  auditLog('CREATE', 'settlement_payment'),
  settlementController.createPayment.bind(settlementController),
);

router.delete(
  '/:id/payments/:paymentId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(settlementPaymentParamsSchema),
  auditLog('DELETE', 'settlement_payment'),
  settlementController.deletePayment.bind(settlementController),
);

router.get(
  '/:id/documents',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  validateParams(settlementIdParamsSchema),
  settlementController.getDocuments.bind(settlementController),
);

router.post(
  '/:id/documents',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(settlementIdParamsSchema),
  validate(createSettlementDocumentSchema),
  auditLog('CREATE', 'settlement_document'),
  settlementController.addDocument.bind(settlementController),
);

router.delete(
  '/:id/documents/:documentId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(settlementDocumentParamsSchema),
  auditLog('DELETE', 'settlement_document'),
  settlementController.deleteDocument.bind(settlementController),
);

export default router;
