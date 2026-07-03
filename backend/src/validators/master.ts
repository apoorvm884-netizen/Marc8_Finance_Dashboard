import { z } from 'zod';

export const masterTypeParamSchema = z.object({
  type: z.string().min(1, 'Master type code is required'),
});

export const masterValueIdParamsSchema = z.object({
  type: z.string().min(1, 'Master type code is required'),
  id: z.string().min(1, 'Master value ID is required').uuid('Invalid master value ID format'),
});

export const createMasterValueSchema = z.object({
  code: z.string().min(1, 'Code is required').max(100, 'Code must not exceed 100 characters'),
  name: z.string().min(1, 'Name is required').max(255, 'Name must not exceed 255 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional().nullable(),
  display_order: z.number().int().min(0, 'Display order must be 0 or greater').optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const updateMasterValueSchema = z.object({
  code: z.string().min(1, 'Code is required').max(100, 'Code must not exceed 100 characters').optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name must not exceed 255 characters').optional(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional().nullable(),
  display_order: z.number().int().min(0, 'Display order must be 0 or greater').optional().nullable(),
  is_active: z.boolean().optional(),
});

export const masterValueQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  is_active: z.string().optional(),
  include_deleted: z.string().optional(),
});
