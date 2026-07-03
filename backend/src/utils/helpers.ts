import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { AuthPayload, User, PaginationParams, UserRole } from '../types';

export function generateUUID(): string {
  return uuidv4();
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as AuthPayload;
}

export function sanitizeUser(user: User): Omit<User, 'password_hash'> {
  const { password_hash, ...sanitizedUser } = user;
  return sanitizedUser;
}

export function parsePagination(query: {
  page?: string;
  limit?: string;
}): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function parseSort(
  query: { sort_by?: string; sort_order?: string },
  allowedFields: string[] = ['code', 'name', 'display_order', 'created_at', 'updated_at', 'username', 'email', 'role']
): { column: string; order: 'asc' | 'desc' } {
  const column = query.sort_by && allowedFields.includes(query.sort_by)
    ? query.sort_by
    : 'created_at';
  const order = query.sort_order === 'asc' ? 'asc' : 'desc';

  return { column, order };
}

export function parseFilters(
  filters: Record<string, string | undefined>,
  allowedFilters: string[] = ['role', 'is_active', 'search']
): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (const key of allowedFilters) {
    if (filters[key] !== undefined && filters[key] !== '') {
      parsed[key] = filters[key]!;
    }
  }

  return parsed;
}

export function getRolePermissions(role: UserRole): string[] {
  const permissions: Record<UserRole, string[]> = {
    [UserRole.SUPER_ADMIN]: [
      'users:create', 'users:read', 'users:update', 'users:delete', 'users:activate', 'users:deactivate',
      'vehicles:create', 'vehicles:read', 'vehicles:update', 'vehicles:delete',
      'bookings:create', 'bookings:read', 'bookings:update', 'bookings:delete', 'bookings:approve',
      'expenses:create', 'expenses:read', 'expenses:update', 'expenses:delete', 'expenses:approve',
      'reports:create', 'reports:read', 'reports:export',
      'audit:read',
      'owners:create', 'owners:read', 'owners:update', 'owners:delete', 'owners:restore', 'owners:assign', 'owners:manage-documents',
      'settlements:create', 'settlements:read', 'settlements:update', 'settlements:delete', 'settlements:restore',
      'settlements:approve', 'settlements:reject', 'settlements:run-pipeline',
      'settlements:pay', 'settlements:manage-documents',
    ],
    [UserRole.ADMIN]: [
      'users:create', 'users:read', 'users:update', 'users:activate', 'users:deactivate',
      'vehicles:create', 'vehicles:read', 'vehicles:update', 'vehicles:delete',
      'bookings:create', 'bookings:read', 'bookings:update', 'bookings:delete', 'bookings:approve',
      'expenses:create', 'expenses:read', 'expenses:update', 'expenses:delete', 'expenses:approve',
      'reports:create', 'reports:read', 'reports:export',
      'owners:create', 'owners:read', 'owners:update', 'owners:delete', 'owners:restore', 'owners:assign', 'owners:manage-documents',
      'settlements:create', 'settlements:read', 'settlements:update', 'settlements:delete', 'settlements:restore',
      'settlements:approve', 'settlements:reject', 'settlements:run-pipeline',
      'settlements:pay', 'settlements:manage-documents',
    ],
    [UserRole.MANAGER]: [
      'users:read',
      'vehicles:create', 'vehicles:read', 'vehicles:update',
      'bookings:create', 'bookings:read', 'bookings:update', 'bookings:approve',
      'expenses:create', 'expenses:read', 'expenses:update', 'expenses:approve',
      'reports:create', 'reports:read', 'reports:export',
      'owners:create', 'owners:read', 'owners:update', 'owners:assign', 'owners:manage-documents',
      'settlements:create', 'settlements:read', 'settlements:update',
      'settlements:approve', 'settlements:reject', 'settlements:run-pipeline',
      'settlements:pay', 'settlements:manage-documents',
    ],
    [UserRole.OPERATOR]: [
      'vehicles:read',
      'bookings:create', 'bookings:read', 'bookings:update',
      'expenses:create', 'expenses:read',
      'owners:read',
      'settlements:read',
    ],
    [UserRole.VIEWER]: [
      'users:read',
      'vehicles:read',
      'bookings:read',
      'expenses:read',
      'reports:read',
      'owners:read',
      'settlements:read',
    ],
  };

  return permissions[role] || [];
}
