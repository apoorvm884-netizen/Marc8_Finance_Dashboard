import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import type { Reminder, CreateReminderDTO, UpdateReminderDTO } from '../types';
import { notificationService } from './notification.service';

const REMINDER_ALLOWED_SORT_FIELDS = ['due_date', 'reminder_type', 'status', 'title', 'created_at'] as const;

class ReminderService {
  async create(data: CreateReminderDTO, createdBy?: string): Promise<Reminder> {
    const db = getDatabase();
    const [reminder] = await db('reminders').insert({
      reminder_type: data.reminder_type,
      vehicle_id: data.vehicle_id ?? null,
      title: data.title,
      description: data.description ?? null,
      due_date: data.due_date,
      remind_before_days: data.remind_before_days ?? 7,
      is_recurring: data.is_recurring ?? false,
      recurring_interval_days: data.recurring_interval_days ?? null,
      status: data.status ?? 'PENDING',
      created_by: createdBy ?? null,
      updated_by: createdBy ?? null,
    }).returning('*');
    return reminder;
  }

  async findAll(query: {
    page?: string; limit?: string; sort_by?: string; sort_order?: string;
    status?: string; search?: string; reminder_type?: string;
    vehicle_id?: string; due_date_from?: string; due_date_to?: string;
  }) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...REMINDER_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['status', 'search', 'reminder_type', 'vehicle_id']);

    let queryBuilder = db('reminders')
      .leftJoin('vehicles', 'reminders.vehicle_id', 'vehicles.id')
      .select(
        'reminders.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
      )
      .whereNull('reminders.deleted_at');

    if (filters.search) {
      queryBuilder = queryBuilder.where(function () {
        this.whereRaw('LOWER(reminders.title) LIKE ?', [`%${String(filters.search).toLowerCase()}%`])
          .orWhereRaw('LOWER(reminders.description) LIKE ?', [`%${String(filters.search).toLowerCase()}%`]);
      });
    }
    if (filters.status) {
      queryBuilder = queryBuilder.where('reminders.status', filters.status);
    }
    if (filters.reminder_type) {
      queryBuilder = queryBuilder.where('reminders.reminder_type', filters.reminder_type);
    }
    if (filters.vehicle_id) {
      queryBuilder = queryBuilder.where('reminders.vehicle_id', filters.vehicle_id);
    }
    if (query.due_date_from) {
      queryBuilder = queryBuilder.where('reminders.due_date', '>=', query.due_date_from);
    }
    if (query.due_date_to) {
      queryBuilder = queryBuilder.where('reminders.due_date', '<=', query.due_date_to);
    }

    const countResult = await queryBuilder.clone().count('* as count').first() as { count: string | number } | undefined;
    const total = Number(countResult?.count ?? 0);

    const reminders = await queryBuilder
      .orderBy(sort.column, sort.order)
      .limit(pagination.limit)
      .offset(pagination.offset);

    return {
      data: reminders,
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

  async findById(id: string): Promise<Reminder> {
    const db = getDatabase();
    const [reminder] = await db('reminders')
      .leftJoin('vehicles', 'reminders.vehicle_id', 'vehicles.id')
      .select('reminders.*', 'vehicles.vehicle_number', 'vehicles.vehicle_name')
      .where('reminders.id', id)
      .whereNull('reminders.deleted_at');
    if (!reminder) throw new NotFoundError('Reminder not found');
    return reminder;
  }

  async update(id: string, data: UpdateReminderDTO, updatedBy?: string): Promise<Reminder> {
    const db = getDatabase();
    const [existing] = await db('reminders').where({ id }).whereNull('deleted_at');
    if (!existing) throw new NotFoundError('Reminder not found');
    const updateData: Record<string, unknown> = { updated_at: db.fn.now(), updated_by: updatedBy ?? null };
    if (data.reminder_type !== undefined) updateData.reminder_type = data.reminder_type;
    if (data.vehicle_id !== undefined) updateData.vehicle_id = data.vehicle_id;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    if (data.remind_before_days !== undefined) updateData.remind_before_days = data.remind_before_days;
    if (data.is_recurring !== undefined) updateData.is_recurring = data.is_recurring;
    if (data.recurring_interval_days !== undefined) updateData.recurring_interval_days = data.recurring_interval_days;
    if (data.status !== undefined) updateData.status = data.status;
    await db('reminders').where({ id }).update(updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    const [existing] = await db('reminders').where({ id }).whereNull('deleted_at');
    if (!existing) throw new NotFoundError('Reminder not found');
    await db('reminders').where({ id }).update({ deleted_at: db.fn.now(), updated_at: db.fn.now() });
  }

  async restore(id: string, updatedBy?: string): Promise<Reminder> {
    const db = getDatabase();
    const [existing] = await db('reminders').where({ id });
    if (!existing) throw new NotFoundError('Reminder not found');
    await db('reminders').where({ id }).update({ deleted_at: null, updated_at: db.fn.now(), updated_by: updatedBy ?? null });
    return this.findById(id);
  }

  async getUpcoming(days: number = 30): Promise<Reminder[]> {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return db('reminders')
      .leftJoin('vehicles', 'reminders.vehicle_id', 'vehicles.id')
      .select('reminders.*', 'vehicles.vehicle_number', 'vehicles.vehicle_name')
      .whereNull('reminders.deleted_at')
      .where('reminders.status', 'PENDING')
      .where('reminders.due_date', '>=', today)
      .where('reminders.due_date', '<=', future)
      .orderBy('reminders.due_date', 'asc');
  }

  async getDueToday(): Promise<Reminder[]> {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    return db('reminders')
      .leftJoin('vehicles', 'reminders.vehicle_id', 'vehicles.id')
      .select('reminders.*', 'vehicles.vehicle_number', 'vehicles.vehicle_name')
      .whereNull('reminders.deleted_at')
      .where('reminders.status', 'PENDING')
      .where('reminders.due_date', '<=', today)
      .orderBy('reminders.due_date', 'asc');
  }

  async processDueReminders(): Promise<number> {
    const dueReminders = await this.getDueToday();
    let count = 0;
    for (const reminder of dueReminders) {
      await notificationService.create({
        type: 'warning',
        title: `Reminder: ${reminder.title}`,
        message: reminder.description
          ? `${reminder.description} — Due: ${reminder.due_date}`
          : `Due: ${reminder.due_date}`,
        entity_type: 'reminder',
        entity_id: reminder.id,
      });
      const dbUpdate = getDatabase();
      await dbUpdate('reminders').where({ id: reminder.id }).update({ last_triggered_at: dbUpdate.fn.now() });
      count++;
    }
    return count;
  }
}

export const reminderService = new ReminderService();
