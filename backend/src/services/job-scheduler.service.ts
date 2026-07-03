import { getDatabase } from '../config/database';
import { parsePagination } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import type { ScheduledJob, CreateScheduledJobDTO, UpdateScheduledJobDTO, ScheduledJobExecution, PaginationMeta } from '../types';

export class JobSchedulerService {
  async create(data: CreateScheduledJobDTO): Promise<ScheduledJob> {
    const db = getDatabase();
    const nextRun = this.computeNextRun(data.schedule_type, data.schedule_config as Record<string, number> | undefined);
    const [job] = await db('scheduled_jobs').insert({
      name: data.name,
      automation_rule_id: data.automation_rule_id || null,
      job_type: data.job_type,
      schedule_type: data.schedule_type,
      cron_expression: data.cron_expression || null,
      schedule_config: data.schedule_config ? JSON.stringify(data.schedule_config) : null,
      is_active: data.is_active !== false,
      retry_on_failure: data.retry_on_failure !== false,
      max_retries: data.max_retries ?? 3,
      next_run_at: nextRun,
    }).returning('*');
    return job;
  }

  async findAll(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const offset = (page - 1) * limit;

    let qb = db('scheduled_jobs').select('*');
    if (query.job_type) qb = qb.where('job_type', query.job_type);
    if (query.is_active !== undefined) qb = qb.where('is_active', query.is_active === 'true');

    const countResult = await qb.clone().count('* as count').first() as { count: string | number };
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy('next_run_at', 'asc').limit(limit).offset(offset);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 },
    };
  }

  async findById(id: string): Promise<ScheduledJob> {
    const db = getDatabase();
    const job = await db('scheduled_jobs').where({ id }).first();
    if (!job) throw new NotFoundError('Scheduled job not found');
    return job;
  }

  async update(id: string, data: UpdateScheduledJobDTO): Promise<ScheduledJob> {
    const db = getDatabase();
    const existing = await db('scheduled_jobs').where({ id }).first();
    if (!existing) throw new NotFoundError('Scheduled job not found');

    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.automation_rule_id !== undefined) updateData.automation_rule_id = data.automation_rule_id;
    if (data.schedule_type !== undefined) {
      updateData.schedule_type = data.schedule_type;
      updateData.next_run_at = this.computeNextRun(data.schedule_type, data.schedule_config as Record<string, number> | undefined);
    }
    if (data.cron_expression !== undefined) updateData.cron_expression = data.cron_expression;
    if (data.schedule_config !== undefined) updateData.schedule_config = data.schedule_config ? JSON.stringify(data.schedule_config) : null;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.retry_on_failure !== undefined) updateData.retry_on_failure = data.retry_on_failure;
    if (data.max_retries !== undefined) updateData.max_retries = data.max_retries;

    const [job] = await db('scheduled_jobs').where({ id }).update(updateData).returning('*');
    return job;
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    const existing = await db('scheduled_jobs').where({ id }).first();
    if (!existing) throw new NotFoundError('Scheduled job not found');
    await db('scheduled_jobs').where({ id }).del();
  }

  async getDueJobs(): Promise<ScheduledJob[]> {
    const db = getDatabase();
    return db('scheduled_jobs')
      .where('is_active', true)
      .where('next_run_at', '<=', db.fn.now())
      .orderBy('next_run_at', 'asc');
  }

  async executeJob(jobId: string): Promise<ScheduledJobExecution> {
    const db = getDatabase();
    const job = await db('scheduled_jobs').where({ id: jobId, is_active: true }).first();
    if (!job) throw new NotFoundError('Active scheduled job not found');

    const [execution] = await db('scheduled_job_executions').insert({
      scheduled_job_id: jobId,
      status: 'running',
      started_at: db.fn.now(),
    }).returning('*');

    try {
      let result: Record<string, unknown> = {};

      if (job.automation_rule_id) {
        const { automationService } = await import('./automation.service');
        const exec = await automationService.executeRule(job.automation_rule_id, 'schedule');
        result = { automation_execution_id: exec.id, status: exec.status };
      } else {
        result = { message: `Job type "${job.job_type}" executed (no automation rule linked)` };
      }

      const nextRun = this.computeNextRun(job.schedule_type, job.schedule_config as Record<string, number> | undefined);

      await db('scheduled_jobs').where({ id: jobId }).update({
        last_run_at: db.fn.now(),
        next_run_at: nextRun,
      });

      const [updated] = await db('scheduled_job_executions').where({ id: execution.id }).update({
        status: 'completed',
        completed_at: db.fn.now(),
        result: JSON.stringify(result),
      }).returning('*');

      return updated;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const [failed] = await db('scheduled_job_executions').where({ id: execution.id }).update({
        status: 'failed',
        completed_at: db.fn.now(),
        error_message: errorMessage,
      }).returning('*');
      return failed;
    }
  }

  async getExecutions(jobId: string, query: Record<string, string | undefined> = {}) {
    const db = getDatabase();
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const offset = (page - 1) * limit;

    let qb = db('scheduled_job_executions')
      .where({ scheduled_job_id: jobId });
    if (query.status) qb = qb.where('status', query.status);

    const countResult = await qb.clone().count('* as count').first() as { count: string | number };
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy('created_at', 'desc').limit(limit).offset(offset);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 },
    };
  }

  private computeNextRun(scheduleType: string, config?: Record<string, number>): string | null {
    const now = new Date();
    const hour = config?.hour ?? 0;
    const minute = config?.minute ?? 0;
    const dayOfWeek = config?.day_of_week ?? 1;
    const dayOfMonth = config?.day_of_month ?? 1;

    const next = new Date(now);
    next.setSeconds(0, 0);

    switch (scheduleType) {
      case 'daily':
        next.setHours(hour, minute, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setHours(hour, minute, 0, 0);
        while (next.getDay() !== dayOfWeek || next <= now) next.setDate(next.getDate() + 1);
        break;
      case 'monthly':
        next.setDate(dayOfMonth);
        next.setHours(hour, minute, 0, 0);
        if (next <= now) next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly': {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        next.setMonth(quarterMonth);
        next.setDate(dayOfMonth);
        next.setHours(hour, minute, 0, 0);
        if (next <= now) next.setMonth(next.getMonth() + 3);
        break;
      }
      case 'yearly':
        next.setMonth(0);
        next.setDate(dayOfMonth);
        next.setHours(hour, minute, 0, 0);
        if (next <= now) next.setFullYear(next.getFullYear() + 1);
        break;
      case 'custom':
        return config?.cron ? undefined as unknown as string : null;
      default:
        return null;
    }
    return next.toISOString();
  }
}

export const jobSchedulerService = new JobSchedulerService();
