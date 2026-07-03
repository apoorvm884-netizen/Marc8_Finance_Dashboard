import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import type {
  Task, TaskComment, CreateTaskDTO, UpdateTaskDTO, CreateTaskCommentDTO, PaginationMeta,
} from '../types';
import { activityService } from './activity.service';

const ALLOWED_SORT_FIELDS = ['created_at', 'updated_at', 'due_at', 'priority', 'status', 'title'] as const;

export class TaskService {
  async create(data: CreateTaskDTO, userId?: string): Promise<Task> {
    const db = getDatabase();
    const [task] = await db('tasks').insert({
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
      title: data.title,
      description: data.description || null,
      assigned_to: data.assigned_to || null,
      assigned_by: userId || null,
      priority: data.priority || 'normal',
      due_at: data.due_at || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      created_by: userId || null,
    }).returning('*');

    if (data.entity_type && data.entity_id) {
      await activityService.log({
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        action: 'task_created',
        description: `Task created: ${data.title}`,
        performed_by: userId,
        metadata: { task_id: task.id, priority: data.priority },
      });
    }

    return task;
  }

  async findAll(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['status', 'priority', 'assigned_to', 'search']);
    let qb = db('tasks')
      .whereNull('tasks.deleted_at')
      .leftJoin('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .leftJoin('users as assigner', 'tasks.assigned_by', 'assigner.id')
      .select(
        'tasks.*',
        db.raw("CONCAT(assignee.first_name, ' ', assignee.last_name) as assigned_to_name"),
        db.raw("CONCAT(assigner.first_name, ' ', assigner.last_name) as assigned_by_name")
      );
    if (filters.status) qb = qb.where('tasks.status', filters.status);
    if (filters.priority) qb = qb.where('tasks.priority', filters.priority);
    if (filters.assigned_to) qb = qb.where('tasks.assigned_to', filters.assigned_to);
    if (filters.search) qb = qb.where('tasks.title', 'ilike', `%${filters.search}%`);
    const countResult = await qb.clone().count('* as count').first() as { count: string | number };
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy(sort.column, sort.order).limit(pagination.limit).offset(pagination.offset);
    const meta: PaginationMeta = {
      page: pagination.page, limit: pagination.limit, total,
      totalPages: Math.ceil(total / pagination.limit),
      hasNextPage: pagination.page * pagination.limit < total,
      hasPreviousPage: pagination.page > 1,
    };
    return { data, meta };
  }

  async findById(id: string): Promise<Task> {
    const db = getDatabase();
    const task = await db('tasks')
      .where('tasks.id', id)
      .whereNull('tasks.deleted_at')
      .leftJoin('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .leftJoin('users as assigner', 'tasks.assigned_by', 'assigner.id')
      .select(
        'tasks.*',
        db.raw("CONCAT(assignee.first_name, ' ', assignee.last_name) as assigned_to_name"),
        db.raw("CONCAT(assigner.first_name, ' ', assigner.last_name) as assigned_by_name")
      )
      .first();
    if (!task) throw new NotFoundError('Task not found');
    const comments = await db('task_comments')
      .where({ task_id: id })
      .leftJoin('users', 'task_comments.created_by', 'users.id')
      .select(
        'task_comments.*',
        db.raw("CONCAT(users.first_name, ' ', users.last_name) as created_by_name")
      )
      .orderBy('created_at', 'asc');
    task.comments = comments;
    return task;
  }

  async update(id: string, data: UpdateTaskDTO, userId?: string): Promise<Task> {
    const db = getDatabase();
    const existing = await db('tasks').where({ id }).whereNull('deleted_at').first();
    if (!existing) throw new NotFoundError('Task not found');
    const updateData: Record<string, unknown> = { updated_at: db.fn.now(), updated_by: userId || null };
    const fields: (keyof UpdateTaskDTO)[] = ['title', 'description', 'assigned_to', 'priority', 'status', 'due_at', 'metadata'];
    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = field === 'metadata' ? JSON.stringify(data[field]) : data[field];
      }
    }
    if (data.status === 'completed') updateData.completed_at = db.fn.now();
    const [task] = await db('tasks').where({ id }).update(updateData).returning('*');
    return task;
  }

  async delete(id: string, userId?: string): Promise<void> {
    const db = getDatabase();
    const existing = await db('tasks').where({ id }).whereNull('deleted_at').first();
    if (!existing) throw new NotFoundError('Task not found');
    await db('tasks').where({ id }).update({
      deleted_at: db.fn.now(),
      deleted_by: userId || null,
      updated_at: db.fn.now(),
    });
  }

  async addComment(taskId: string, data: CreateTaskCommentDTO, userId?: string): Promise<TaskComment> {
    const db = getDatabase();
    const task = await db('tasks').where({ id: taskId }).whereNull('deleted_at').first();
    if (!task) throw new NotFoundError('Task not found');
    const [comment] = await db('task_comments').insert({
      task_id: taskId,
      comment: data.comment,
      created_by: userId || null,
    }).returning('*');
    return comment;
  }

  async getComments(taskId: string): Promise<TaskComment[]> {
    const db = getDatabase();
    return db('task_comments')
      .where({ task_id: taskId })
      .leftJoin('users', 'task_comments.created_by', 'users.id')
      .select(
        'task_comments.*',
        db.raw("CONCAT(users.first_name, ' ', users.last_name) as created_by_name")
      )
      .orderBy('created_at', 'asc');
  }

  async getTaskSummary(): Promise<{ pending: number; in_progress: number; completed: number; overdue: number }> {
    const db = getDatabase();
    const [counts] = await db('tasks')
      .whereNull('deleted_at')
      .select(
        db.raw("COUNT(*) FILTER (WHERE status = 'pending') as pending"),
        db.raw("COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress"),
        db.raw("COUNT(*) FILTER (WHERE status = 'completed') as completed"),
        db.raw("COUNT(*) FILTER (WHERE status != 'completed' AND status != 'cancelled' AND due_at < NOW()) as overdue")
      );
    return counts;
  }
}

export const taskService = new TaskService();
