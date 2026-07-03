import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { getDatabase } from '../config/database';
import { logger } from '../utils/logger';

interface AuditLogData {
  userId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  description?: string;
}

export async function createAuditLog(data: AuditLogData, req: AuthenticatedRequest): Promise<void> {
  try {
    const db = getDatabase();
    await db('audit_logs').insert({
      user_id: data.userId,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId || null,
      old_values: data.oldValues ? JSON.stringify(data.oldValues) : null,
      new_values: data.newValues ? JSON.stringify(data.newValues) : null,
      description: data.description || null,
      ip_address: req.ip || req.socket.remoteAddress || null,
      user_agent: req.headers['user-agent'] || null,
      created_at: db.fn.now(),
    });
  } catch (error) {
    logger.error('Failed to create audit log', error);
  }
}

export function auditLog(action: string, entityType: string) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const originalJson = _res.json.bind(_res);

    _res.json = function (body: unknown) {
      if (_res.statusCode < 400 && req.user) {
        const params = req.params as Record<string, string>;
        const bodyRecord = body as Record<string, unknown>;
        const entityId = params.id || (bodyRecord?.data as Record<string, unknown> | undefined)?.id as string | undefined;
        createAuditLog(
          {
            userId: req.user.userId,
            action,
            entityType,
            entityId,
            newValues: req.method !== 'DELETE' ? (() => {
              const body = req.body as Record<string, unknown>;
              const sensitive = ['password', 'currentPassword', 'newPassword', 'confirmPassword', 'token', 'refreshToken'];
              const filtered: Record<string, unknown> = {};
              for (const [key, value] of Object.entries(body)) {
                if (!sensitive.includes(key)) filtered[key] = value;
              }
              return filtered;
            })() : undefined,
            description: `${action} ${entityType}${entityId ? `: ${entityId}` : ''}`,
          },
          req
        );
      }
      return originalJson(body);
    };

    next();
  };
}
