import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must not exceed 100 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z
      .string()
      .min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  first_name: z
    .string()
    .max(100, 'First name must not exceed 100 characters')
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  last_name: z
    .string()
    .max(100, 'Last name must not exceed 100 characters')
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  role: z.string().min(1, 'User role is required'),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  first_name: z
    .string()
    .max(100, 'First name must not exceed 100 characters')
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  last_name: z
    .string()
    .max(100, 'Last name must not exceed 100 characters')
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  role: z.string().optional(),
  is_active: z.boolean().optional(),
  restrictions: z.record(z.unknown()).optional().nullable(),
});

export const updateProfileSchema = z.object({
  first_name: z.string().max(100).optional().nullable().transform((v) => v || undefined),
  last_name: z.string().max(100).optional().nullable().transform((v) => v || undefined),
  email: z.string().email('Invalid email').max(255).optional().nullable().transform((v) => v || undefined),
});

export const userIdParamsSchema = z.object({
  id: z
    .string()
    .min(1, 'User ID is required')
    .uuid('Invalid user ID format'),
});
