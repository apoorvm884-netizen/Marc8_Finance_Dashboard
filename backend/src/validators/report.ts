import { z } from 'zod';
import { REPORT_TYPES } from '../types/report';

export const generateReportSchema = z.object({
  report_type: z.enum(REPORT_TYPES),
  filters: z.object({
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    vehicle_id: z.string().uuid().optional(),
    platform_id: z.string().uuid().optional(),
    expense_category_id: z.string().uuid().optional(),
    payment_mode_id: z.string().uuid().optional(),
    journal_category_id: z.string().uuid().optional(),
    status: z.string().optional(),
  }).optional().default({}),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255),
  report_type: z.enum(REPORT_TYPES),
  filters: z.object({
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    vehicle_id: z.string().uuid().optional(),
    platform_id: z.string().uuid().optional(),
    expense_category_id: z.string().uuid().optional(),
    payment_mode_id: z.string().uuid().optional(),
    journal_category_id: z.string().uuid().optional(),
    status: z.string().optional(),
  }).optional().default({}),
  is_favorite: z.boolean().optional().default(false),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  filters: z.object({
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    vehicle_id: z.string().uuid().optional(),
    platform_id: z.string().uuid().optional(),
    expense_category_id: z.string().uuid().optional(),
    payment_mode_id: z.string().uuid().optional(),
    journal_category_id: z.string().uuid().optional(),
    status: z.string().optional(),
  }).optional(),
  is_favorite: z.boolean().optional(),
});

export const templateIdParamsSchema = z.object({
  id: z.string().uuid('Invalid template ID'),
});

export const exportReportSchema = z.object({
  report_type: z.enum(REPORT_TYPES),
  format: z.enum(['csv', 'xlsx']),
  filters: z.object({
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    vehicle_id: z.string().uuid().optional(),
    platform_id: z.string().uuid().optional(),
    expense_category_id: z.string().uuid().optional(),
    payment_mode_id: z.string().uuid().optional(),
    journal_category_id: z.string().uuid().optional(),
    status: z.string().optional(),
  }).optional().default({}),
});
