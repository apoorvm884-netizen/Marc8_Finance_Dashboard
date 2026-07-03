import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import type {
  Notification, CreateNotificationDTO, NotificationTemplate, UpdateNotificationTemplateDTO,
  NotificationPreferences, UpdateNotificationPreferencesDTO, NotificationHistory,
} from '../types';

const NOTIFICATION_ALLOWED_SORT_FIELDS = ['created_at', 'type', 'is_read', 'title'] as const;

class NotificationService {
  async create(data: CreateNotificationDTO): Promise<Notification> {
    const db = getDatabase();
    const [notification] = await db('notifications').insert({
      type: data.type,
      title: data.title,
      message: data.message ?? null,
      entity_type: data.entity_type ?? null,
      entity_id: data.entity_id ?? null,
      user_id: data.user_id ?? null,
    }).returning('*');
    return notification;
  }

  async findAll(query: {
    page?: string; limit?: string; sort_by?: string; sort_order?: string;
    is_read?: string; type?: string; search?: string;
  }, userId?: string) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...NOTIFICATION_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['is_read', 'type', 'search']);

    let queryBuilder = db('notifications').select('*');

    if (userId) {
      queryBuilder = queryBuilder.where(function () {
        this.where('user_id', userId).orWhereNull('user_id');
      });
    }

    if (filters.search) {
      queryBuilder = queryBuilder.where(function () {
        this.whereRaw('LOWER(title) LIKE ?', [`%${String(filters.search).toLowerCase()}%`])
          .orWhereRaw('LOWER(message) LIKE ?', [`%${String(filters.search).toLowerCase()}%`]);
      });
    }
    if (filters.is_read !== undefined) {
      queryBuilder = queryBuilder.where('is_read', filters.is_read === 'true');
    }
    if (filters.type) {
      queryBuilder = queryBuilder.where('type', filters.type);
    }

    const countResult = await queryBuilder.clone().count('* as count').first() as { count: string | number } | undefined;
    const total = Number(countResult?.count ?? 0);

    const notifications = await queryBuilder
      .orderBy(sort.column, sort.order)
      .limit(pagination.limit)
      .offset(pagination.offset);

    return {
      data: notifications,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNextPage: pagination.page * pagination.limit < total,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  async getUnreadCount(userId?: string): Promise<number> {
    const db = getDatabase();
    let query = db('notifications').where('is_read', false).where('is_archived', false);
    if (userId) query = query.where(function () { this.where('user_id', userId).orWhereNull('user_id'); });
    const result = await query.count('* as count').first();
    return Number(result?.count ?? 0);
  }

  async markAsRead(id: string): Promise<Notification> {
    const db = getDatabase();
    const [existing] = await db('notifications').where({ id });
    if (!existing) throw new NotFoundError('Notification not found');
    const [updated] = await db('notifications').where({ id }).update({ is_read: true, updated_at: db.fn.now() }).returning('*');
    return updated;
  }

  async markAllAsRead(userId?: string): Promise<number> {
    const db = getDatabase();
    let query = db('notifications').where('is_read', false);
    if (userId) query = query.where(function () { this.where('user_id', userId).orWhereNull('user_id'); });
    const result = await query.update({ is_read: true, updated_at: db.fn.now() });
    return result;
  }

  async delete(id: string, userId?: string): Promise<void> {
    const db = getDatabase();
    let query = db('notifications').where({ id });
    if (userId) query = query.where(function () { this.where('user_id', userId).orWhereNull('user_id'); });
    const [existing] = await query;
    if (!existing) throw new NotFoundError('Notification not found');
    await db('notifications').where({ id }).del();
  }

  async getTemplates(): Promise<NotificationTemplate[]> {
    const db = getDatabase();
    return db('notification_templates').where('is_active', true).orderBy('name', 'asc');
  }

  async updateTemplate(id: string, data: UpdateNotificationTemplateDTO): Promise<NotificationTemplate> {
    const db = getDatabase();
    const [existing] = await db('notification_templates').where({ id });
    if (!existing) throw new NotFoundError('Notification template not found');
    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.title_template !== undefined) updateData.title_template = data.title_template;
    if (data.message_template !== undefined) updateData.message_template = data.message_template;
    if (data.variables !== undefined) updateData.variables = JSON.stringify(data.variables);
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    const [updated] = await db('notification_templates').where({ id }).update(updateData).returning('*');
    return updated;
  }

  async getPreferences(): Promise<NotificationPreferences | null> {
    const db = getDatabase();
    const [prefs] = await db('notification_preferences').limit(1);
    return prefs ?? null;
  }

  async getPreferencesByUser(userId: string): Promise<NotificationPreferences> {
    const db = getDatabase();
    let [prefs] = await db('notification_preferences').where({ user_id: userId });
    if (!prefs) {
      [prefs] = await db('notification_preferences').insert({ user_id: userId }).returning('*');
    }
    return prefs;
  }

  async updatePreferences(userId: string, data: UpdateNotificationPreferencesDTO): Promise<NotificationPreferences> {
    const db = getDatabase();
    let [existing] = await db('notification_preferences').where({ user_id: userId });
    if (!existing) {
      [existing] = await db('notification_preferences').insert({ user_id: userId }).returning('*');
    }
    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.in_app_enabled !== undefined) updateData.in_app_enabled = data.in_app_enabled;
    if (data.email_enabled !== undefined) updateData.email_enabled = data.email_enabled;
    if (data.reminder_days_before !== undefined) updateData.reminder_days_before = data.reminder_days_before;
    if (data.daily_summary !== undefined) updateData.daily_summary = data.daily_summary;
    if (data.weekly_summary !== undefined) updateData.weekly_summary = data.weekly_summary;
    const [updated] = await db('notification_preferences').where({ user_id: userId }).update(updateData).returning('*');
    return updated;
  }

  async logHistory(entry: {
    notification_id?: string; reminder_id?: string; user_id?: string;
    action: string; channel?: string;
  }): Promise<void> {
    const db = getDatabase();
    await db('notification_history').insert({
      notification_id: entry.notification_id ?? null,
      reminder_id: entry.reminder_id ?? null,
      user_id: entry.user_id ?? null,
      action: entry.action,
      channel: entry.channel ?? 'in_app',
    });
  }

  async getHistory(userId?: string): Promise<NotificationHistory[]> {
    const db = getDatabase();
    let query = db('notification_history').orderBy('created_at', 'desc').limit(50);
    if (userId) query = query.where({ user_id: userId });
    return query;
  }
}

export const notificationService = new NotificationService();
