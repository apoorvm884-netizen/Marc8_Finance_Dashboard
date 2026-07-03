import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError, ValidationError } from '../utils/errors';
import type {
  ApprovalRequest, ApprovalLevel, ApprovalAction,
  CreateApprovalRequestDTO, ApproveRejectDTO, PaginationMeta,
} from '../types';
import { activityService } from './activity.service';

const ALLOWED_SORT_FIELDS = ['created_at', 'updated_at', 'status'] as const;

export class ApprovalService {
  async create(data: CreateApprovalRequestDTO, userId?: string): Promise<ApprovalRequest> {
    const db = getDatabase();
    const [request] = await db('approval_requests').insert({
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      request_type: data.request_type,
      status: 'pending',
      requested_by: userId || null,
      max_level: data.levels.length,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    }).returning('*');

    for (const level of data.levels) {
      await db('approval_levels').insert({
        approval_request_id: request.id,
        level_number: level.level_number,
        required_roles: level.required_roles ? JSON.stringify(level.required_roles) : null,
        required_users: level.required_users ? JSON.stringify(level.required_users) : null,
        status: 'pending',
      });
    }

    await activityService.log({
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      action: 'approval_requested',
      description: `Approval requested for ${data.request_type}`,
      performed_by: userId,
      metadata: { approval_request_id: request.id, request_type: data.request_type },
    });

    return this.findById(request.id);
  }

  async findAll(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['status', 'entity_type']);
    let qb = db('approval_requests')
      .leftJoin('users', 'approval_requests.requested_by', 'users.id')
      .select(
        'approval_requests.*',
        db.raw("CONCAT(users.first_name, ' ', users.last_name) as requested_by_name")
      );
    if (filters.status) qb = qb.where('approval_requests.status', filters.status);
    if (filters.entity_type) qb = qb.where('approval_requests.entity_type', filters.entity_type);
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

  async findById(id: string): Promise<ApprovalRequest> {
    const db = getDatabase();
    const request = await db('approval_requests')
      .leftJoin('users', 'approval_requests.requested_by', 'users.id')
      .select(
        'approval_requests.*',
        db.raw("CONCAT(users.first_name, ' ', users.last_name) as requested_by_name")
      )
      .where('approval_requests.id', id)
      .first();
    if (!request) throw new NotFoundError('Approval request not found');

    const levels = await db('approval_levels')
      .where({ approval_request_id: id })
      .orderBy('level_number', 'asc');
    for (const level of levels) {
      const actions = await db('approval_actions')
        .where({ approval_level_id: level.id })
        .leftJoin('users', 'approval_actions.performed_by', 'users.id')
        .select(
          'approval_actions.*',
          db.raw("CONCAT(users.first_name, ' ', users.last_name) as performed_by_name")
        )
        .orderBy('created_at', 'asc');
      level.actions = actions;
    }
    request.levels = levels;
    return request;
  }

  async processLevel(requestId: string, data: ApproveRejectDTO, userId?: string): Promise<ApprovalRequest> {
    const db = getDatabase();
    const request = await db('approval_requests').where({ id: requestId }).first();
    if (!request) throw new NotFoundError('Approval request not found');
    if (request.status !== 'pending') throw new ValidationError('Approval request is no longer pending');

    const currentLevel = await db('approval_levels')
      .where({ approval_request_id: requestId, level_number: request.level })
      .first();
    if (!currentLevel) throw new ValidationError('No pending approval level found');

    if (data.action === 'rejected') {
      await db('approval_actions').insert({
        approval_level_id: currentLevel.id,
        approval_request_id: requestId,
        action: 'rejected',
        comment: data.comment || null,
        performed_by: userId || null,
      });
      await db('approval_levels').where({ id: currentLevel.id }).update({ status: 'rejected' });
      await db('approval_requests').where({ id: requestId }).update({
        status: 'rejected',
        updated_at: db.fn.now(),
      });
    } else {
      let actualApprovers: string[] = currentLevel.actual_approvers || [];
      if (userId && !actualApprovers.includes(userId)) actualApprovers.push(userId);

      await db('approval_actions').insert({
        approval_level_id: currentLevel.id,
        approval_request_id: requestId,
        action: 'approved',
        comment: data.comment || null,
        performed_by: userId || null,
      });

      if (request.level >= request.max_level) {
        await db('approval_levels').where({ id: currentLevel.id }).update({
          status: 'approved',
          actual_approvers: JSON.stringify(actualApprovers),
        });
        await db('approval_requests').where({ id: requestId }).update({
          status: 'approved',
          level: request.level,
          updated_at: db.fn.now(),
        });
      } else {
        await db('approval_levels').where({ id: currentLevel.id }).update({
          status: 'approved',
          actual_approvers: JSON.stringify(actualApprovers),
        });
        await db('approval_requests').where({ id: requestId }).update({
          level: request.level + 1,
          updated_at: db.fn.now(),
        });
      }
    }

    await activityService.log({
      entity_type: request.entity_type,
      entity_id: request.entity_id,
      action: `approval_${data.action}`,
      description: `Approval ${data.action} for ${request.request_type}`,
      performed_by: userId,
      metadata: { approval_request_id: requestId, comment: data.comment },
    });

    return this.findById(requestId);
  }

  async getPendingForUser(userId: string): Promise<ApprovalRequest[]> {
    const db = getDatabase();
    const user = await db('users').where({ id: userId }).first();
    if (!user) return [];

    const requests = await db('approval_requests')
      .where({ status: 'pending' })
      .select('*');
    const pending: ApprovalRequest[] = [];
    for (const req of requests) {
      const level = await db('approval_levels')
        .where({ approval_request_id: req.id, level_number: req.level, status: 'pending' })
        .first();
      if (!level) continue;
      const requiredUsers = level.required_users ? JSON.parse(level.required_users) : [];
      const requiredRoles = level.required_roles ? JSON.parse(level.required_roles) : [];
      const isTarget = requiredUsers.includes(userId) || requiredRoles.includes(user.role);
      if (isTarget) pending.push(req);
    }
    return pending;
  }
}

export const approvalService = new ApprovalService();
