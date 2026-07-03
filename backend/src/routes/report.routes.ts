import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams } from '../middleware/validate';
import { UserRole } from '../types';
import {
  generateReportSchema,
  createTemplateSchema,
  updateTemplateSchema,
  templateIdParamsSchema,
  exportReportSchema,
} from '../validators/report';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  reportController.getTemplates.bind(reportController)
);

router.post(
  '/generate',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(generateReportSchema),
  reportController.generateReport.bind(reportController)
);

router.post(
  '/export/csv',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(exportReportSchema),
  reportController.exportCSV.bind(reportController)
);

router.post(
  '/export/excel',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(exportReportSchema),
  reportController.exportExcel.bind(reportController)
);

router.get(
  '/history',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  reportController.getHistory.bind(reportController)
);

router.post(
  '/templates',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(createTemplateSchema),
  reportController.createTemplate.bind(reportController)
);

router.put(
  '/templates/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(templateIdParamsSchema),
  validate(updateTemplateSchema),
  reportController.updateTemplate.bind(reportController)
);

router.delete(
  '/templates/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(templateIdParamsSchema),
  reportController.deleteTemplate.bind(reportController)
);

router.get(
  '/:type',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER),
  reportController.getReportByType.bind(reportController)
);

export default router;
