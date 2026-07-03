import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import type {
  AutomationRule, AutomationExecution, AutomationCondition, AutomationActionDef,
  CreateAutomationRuleDTO, UpdateAutomationRuleDTO, PaginationMeta,
} from '../types';
import { activityService } from './activity.service';

const ALLOWED_SORT_FIELDS = ['created_at', 'updated_at', 'name', 'event_type', 'priority'] as const;

export class AutomationService {
  async createRule(data: CreateAutomationRuleDTO, userId?: string): Promise<AutomationRule> {
    const db = getDatabase();
    const [rule] = await db('automation_rules').insert({
      name: data.name,
      description: data.description || null,
      event_type: data.event_type || null,
      conditions: JSON.stringify(data.conditions || []),
      actions: JSON.stringify(data.actions),
      schedule_config: data.schedule_config ? JSON.stringify(data.schedule_config) : null,
      is_active: data.is_active !== false,
      priority: data.priority || 0,
      cooldown_minutes: data.cooldown_minutes || 0,
      max_executions: data.max_executions || 0,
      created_by: userId || null,
    }).returning('*');
    return rule;
  }

  async findAllRules(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['event_type', 'is_active', 'search']);
    let qb = db('automation_rules');
    if (filters.event_type) qb = qb.where('event_type', filters.event_type);
    if (filters.is_active !== undefined) qb = qb.where('is_active', filters.is_active === 'true');
    if (filters.search) qb = qb.where('name', 'ilike', `%${filters.search}%`);
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

  async findRuleById(id: string): Promise<AutomationRule> {
    const db = getDatabase();
    const rule = await db('automation_rules').where({ id }).first();
    if (!rule) throw new NotFoundError('Automation rule not found');
    return rule;
  }

  async updateRule(id: string, data: UpdateAutomationRuleDTO, userId?: string): Promise<AutomationRule> {
    const db = getDatabase();
    const existing = await db('automation_rules').where({ id }).first();
    if (!existing) throw new NotFoundError('Automation rule not found');
    const updateData: Record<string, unknown> = { updated_at: db.fn.now(), updated_by: userId || null };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.event_type !== undefined) updateData.event_type = data.event_type;
    if (data.conditions !== undefined) updateData.conditions = JSON.stringify(data.conditions);
    if (data.actions !== undefined) updateData.actions = JSON.stringify(data.actions);
    if (data.schedule_config !== undefined) updateData.schedule_config = data.schedule_config ? JSON.stringify(data.schedule_config) : null;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.cooldown_minutes !== undefined) updateData.cooldown_minutes = data.cooldown_minutes;
    if (data.max_executions !== undefined) updateData.max_executions = data.max_executions;
    const [rule] = await db('automation_rules').where({ id }).update(updateData).returning('*');
    return rule;
  }

  async deleteRule(id: string): Promise<void> {
    const db = getDatabase();
    const existing = await db('automation_rules').where({ id }).first();
    if (!existing) throw new NotFoundError('Automation rule not found');
    await db('automation_rules').where({ id }).del();
  }

  async executeRule(ruleId: string, triggerType: 'event' | 'schedule' | 'manual' = 'manual', context?: {
    event_type?: string;
    entity_type?: string;
    entity_id?: string;
  }, userId?: string): Promise<AutomationExecution> {
    const db = getDatabase();
    const rule = await db('automation_rules').where({ id: ruleId, is_active: true }).first();
    if (!rule) throw new NotFoundError('Active automation rule not found');

    if (rule.max_executions > 0 && rule.execution_count >= rule.max_executions) {
      const [exec] = await db('automation_executions').insert({
        automation_rule_id: ruleId,
        event_type: context?.event_type || rule.event_type,
        entity_type: context?.entity_type || null,
        entity_id: context?.entity_id || null,
        status: 'skipped',
        trigger_type: triggerType,
        result: JSON.stringify({ reason: 'Max executions reached' }),
      }).returning('*');
      return exec;
    }

    if (rule.cooldown_minutes > 0 && rule.last_executed_at) {
      const cooldownMs = rule.cooldown_minutes * 60 * 1000;
      const lastRun = new Date(rule.last_executed_at).getTime();
      if (Date.now() - lastRun < cooldownMs) {
        const [exec] = await db('automation_executions').insert({
          automation_rule_id: ruleId,
          event_type: context?.event_type || rule.event_type,
          entity_type: context?.entity_type || null,
          entity_id: context?.entity_id || null,
          status: 'skipped',
          trigger_type: triggerType,
          result: JSON.stringify({ reason: 'Cooldown period active' }),
        }).returning('*');
        return exec;
      }
    }

    const [execution] = await db('automation_executions').insert({
      automation_rule_id: ruleId,
      event_type: context?.event_type || rule.event_type,
      entity_type: context?.entity_type || null,
      entity_id: context?.entity_id || null,
      status: 'executing',
      trigger_type: triggerType,
      started_at: db.fn.now(),
    }).returning('*');

    try {
      const actions: AutomationActionDef[] = typeof rule.actions === 'string' ? JSON.parse(rule.actions) : rule.actions;
      const conditions: AutomationCondition[] = typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions;
      const results: Record<string, unknown>[] = [];

      for (const action of actions) {
        const actionResult = await this.executeAction(action, context, userId);
        results.push(actionResult);
      }

      await db('automation_rules').where({ id: ruleId }).update({
        execution_count: db.raw('execution_count + 1'),
        last_executed_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

      const [updated] = await db('automation_executions').where({ id: execution.id }).update({
        status: 'completed',
        completed_at: db.fn.now(),
        result: JSON.stringify({ actions: results }),
      }).returning('*');

      await activityService.log({
        entity_type: 'automation_rule',
        entity_id: ruleId,
        action: 'automation_executed',
        description: `Automation rule "${rule.name}" executed with ${results.length} action(s)`,
        performed_by: userId,
        metadata: { trigger_type: triggerType, result_count: results.length },
      });

      return updated;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const [failed] = await db('automation_executions').where({ id: execution.id }).update({
        status: 'failed',
        completed_at: db.fn.now(),
        error_message: errorMessage,
      }).returning('*');
      return failed;
    }
  }

  private async executeAction(action: AutomationActionDef, context?: {
    event_type?: string;
    entity_type?: string;
    entity_id?: string;
  }, userId?: string): Promise<Record<string, unknown>> {
    const db = getDatabase();
    const config = action.config || {};

    switch (action.type) {
      case 'create_notification': {
        const { notificationService } = await import('./notification.service');
        const notification = await notificationService.create({
          type: (config.type as 'info' | 'warning' | 'error' | 'success') || 'info',
          title: String(config.title || 'Automation Notification'),
          message: config.message ? String(config.message) : undefined,
          entity_type: context?.entity_type || (config.entity_type as string) || null,
          entity_id: context?.entity_id || (config.entity_id as string) || null,
          user_id: (config.user_id as string) || null,
        });
        return { action: 'create_notification', notification_id: notification.id };
      }

      case 'create_task': {
        const { taskService } = await import('./task.service');
        const task = await taskService.create({
          title: String(config.title || 'Automation Task'),
          description: config.description ? String(config.description) : undefined,
          assigned_to: config.assigned_to as string || undefined,
          priority: (config.priority as 'low' | 'normal' | 'high' | 'urgent') || 'normal',
          entity_type: context?.entity_type || (config.entity_type as string),
          entity_id: context?.entity_id || (config.entity_id as string),
          due_at: config.due_at as string || undefined,
        }, userId);
        return { action: 'create_task', task_id: task.id };
      }

      case 'create_alert': {
        const { intelligenceService } = await import('./intelligence.service');
        const alert = await intelligenceService.createAlert({
          alert_type: String(config.alert_type || 'automation'),
          title: String(config.title || 'Business Alert'),
          description: config.description ? String(config.description) : undefined,
          severity: (config.severity as 'info' | 'warning' | 'critical') || 'info',
          entity_type: context?.entity_type || (config.entity_type as string),
          entity_id: context?.entity_id || (config.entity_id as string),
          metadata: config.metadata as Record<string, unknown> || undefined,
          created_by: userId,
        });
        return { action: 'create_alert', alert_id: alert.id };
      }

      case 'create_recommendation': {
        const { intelligenceService } = await import('./intelligence.service');
        const recommendation = await intelligenceService.createRecommendation({
          recommendation_type: String(config.recommendation_type || 'automation'),
          title: String(config.title || 'Recommendation'),
          description: config.description ? String(config.description) : undefined,
          priority: (config.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
          entity_type: context?.entity_type || (config.entity_type as string),
          entity_id: context?.entity_id || (config.entity_id as string),
          supporting_data: config.supporting_data as Record<string, unknown> || undefined,
        });
        return { action: 'create_recommendation', recommendation_id: recommendation.id };
      }

      case 'trigger_workflow': {
        const { workflowService } = await import('./workflow.service');
        const result = await workflowService.transition(
          context?.entity_type || String(config.entity_type || ''),
          context?.entity_id || String(config.entity_id || ''),
          { action: String(config.action || '') },
          userId
        );
        return { action: 'trigger_workflow', instance_id: result.instance.id, new_state: result.instance.current_state };
      }

      case 'send_email':
        return { action: 'send_email', status: 'not_implemented', message: 'Email sending not yet implemented' };

      default:
        return { action: action.type, status: 'unknown_action_type' };
    }
  }

  async getExecutions(ruleId: string, query: Record<string, string | undefined> = {}) {
    const db = getDatabase();
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const offset = (page - 1) * limit;

    let qb = db('automation_executions')
      .leftJoin('automation_rules', 'automation_executions.automation_rule_id', 'automation_rules.id')
      .select('automation_executions.*', 'automation_rules.name as rule_name')
      .where('automation_executions.automation_rule_id', ruleId);

    if (query.status) qb = qb.where('automation_executions.status', query.status);

    const countResult = await qb.clone().count('* as count').first() as { count: string | number };
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy('automation_executions.created_at', 'desc').limit(limit).offset(offset);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 },
    };
  }

  async processEvent(eventType: string, context?: {
    entity_type?: string;
    entity_id?: string;
    metadata?: Record<string, unknown>;
  }, userId?: string): Promise<AutomationExecution[]> {
    const db = getDatabase();
    const rules = await db('automation_rules')
      .where({ event_type: eventType, is_active: true })
      .orderBy('priority', 'desc');

    const executions: AutomationExecution[] = [];
    for (const rule of rules) {
      if (!this.evaluateConditions(rule.conditions, context?.metadata)) continue;
      const execution = await this.executeRule(rule.id, 'event', {
        event_type: eventType,
        entity_type: context?.entity_type,
        entity_id: context?.entity_id,
      }, userId);
      executions.push(execution);
    }
    return executions;
  }

  private evaluateConditions(conditionsRaw: unknown, metadata?: Record<string, unknown>): boolean {
    if (!conditionsRaw) return true;
    const conditions: AutomationCondition[] = typeof conditionsRaw === 'string' ? JSON.parse(conditionsRaw) : conditionsRaw;
    if (!conditions.length) return true;
    if (!metadata) return false;

    for (const condition of conditions) {
      const actualValue = metadata[condition.field];
      switch (condition.operator) {
        case 'eq': if (actualValue !== condition.value) return false; break;
        case 'ne': if (actualValue === condition.value) return false; break;
        case 'gt': if (actualValue === undefined || Number(actualValue) <= Number(condition.value)) return false; break;
        case 'gte': if (actualValue === undefined || Number(actualValue) < Number(condition.value)) return false; break;
        case 'lt': if (actualValue === undefined || Number(actualValue) >= Number(condition.value)) return false; break;
        case 'lte': if (actualValue === undefined || Number(actualValue) > Number(condition.value)) return false; break;
        case 'contains': if (!String(actualValue).includes(String(condition.value))) return false; break;
        case 'in': if (!Array.isArray(condition.value) || !condition.value.includes(actualValue)) return false; break;
      }
    }
    return true;
  }

  async getExecutionSummary(): Promise<{
    total: number; completed: number; failed: number; skipped: number; running: number;
  }> {
    const db = getDatabase();
    const [summary] = await db('automation_executions')
      .select(
        db.raw("COUNT(*) FILTER (WHERE status = 'completed') as completed"),
        db.raw("COUNT(*) FILTER (WHERE status = 'failed') as failed"),
        db.raw("COUNT(*) FILTER (WHERE status = 'skipped') as skipped"),
        db.raw("COUNT(*) FILTER (WHERE status = 'executing') as running"),
        db.raw('COUNT(*) as total')
      );
    return summary;
  }
}

export const automationService = new AutomationService();
