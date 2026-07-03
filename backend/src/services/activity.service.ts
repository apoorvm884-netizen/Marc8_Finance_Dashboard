import { getDatabase } from '../config/database';
import type { ActivityLogEntry, CreateActivityLogDTO, PaginationMeta } from '../types';

export class ActivityService {
  async log(data: CreateActivityLogDTO): Promise<ActivityLogEntry> {
    const db = getDatabase();
    const [entry] = await db('activity_log').insert({
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      action: data.action,
      description: data.description || null,
      old_values: data.old_values ? JSON.stringify(data.old_values) : null,
      new_values: data.new_values ? JSON.stringify(data.new_values) : null,
      performed_by: data.performed_by || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    }).returning('*');
    return entry;
  }

  async findByEntity(entityType: string, entityId: string, query: Record<string, string | undefined> = {}) {
    const db = getDatabase();
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const offset = (page - 1) * limit;

    let qb = db('activity_log')
      .where({ entity_type: entityType, entity_id: entityId })
      .leftJoin('users', 'activity_log.performed_by', 'users.id')
      .select(
        'activity_log.*',
        db.raw("CONCAT(users.first_name, ' ', users.last_name) as performed_by_name")
      );

    if (query.action) qb = qb.where('activity_log.action', query.action);

    const countResult = await qb.clone().count('* as count').first() as { count: string | number };
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy('activity_log.created_at', 'desc').limit(limit).offset(offset);
    const meta: PaginationMeta = {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
    return { data, meta };
  }

  async findAll(query: Record<string, string | undefined> = {}) {
    const db = getDatabase();
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const offset = (page - 1) * limit;

    let qb = db('activity_log')
      .leftJoin('users', 'activity_log.performed_by', 'users.id')
      .select(
        'activity_log.*',
        db.raw("CONCAT(users.first_name, ' ', users.last_name) as performed_by_name")
      );

    if (query.entity_type) qb = qb.where('activity_log.entity_type', query.entity_type);
    if (query.entity_id) qb = qb.where('activity_log.entity_id', query.entity_id);
    if (query.action) qb = qb.where('activity_log.action', query.action);
    if (query.date_from) qb = qb.where('activity_log.created_at', '>=', query.date_from);
    if (query.date_to) qb = qb.where('activity_log.created_at', '<=', query.date_to);

    const countResult = await qb.clone().count('* as count').first() as { count: string | number };
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy('activity_log.created_at', 'desc').limit(limit).offset(offset);
    const meta: PaginationMeta = {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
    return { data, meta };
  }
}

export const activityService = new ActivityService();
