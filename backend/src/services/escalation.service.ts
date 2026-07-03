import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import type { EscalationRule, UpdateEscalationRuleDTO, PaginationMeta } from '../types';

const ALLOWED_SORT_FIELDS = ['created_at', 'updated_at', 'name', 'trigger_after_minutes'] as const;

export class EscalationService {
  async createRule(data: {
    sla_definition_id?: string;
    entity_type: string;
    name: string;
    trigger_after_minutes: number;
    escalate_to_role?: string;
    escalate_to_user?: string;
    notify?: boolean;
  }): Promise<EscalationRule> {
    const db = getDatabase();
    const [rule] = await db('escalation_rules').insert({
      sla_definition_id: data.sla_definition_id || null,
      entity_type: data.entity_type,
      name: data.name,
      trigger_after_minutes: data.trigger_after_minutes,
      escalate_to_role: data.escalate_to_role || null,
      escalate_to_user: data.escalate_to_user || null,
      notify: data.notify !== undefined ? data.notify : true,
    }).returning('*');
    return rule;
  }

  async findAllRules(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['entity_type', 'is_active']);
    let qb = db('escalation_rules')
      .leftJoin('sla_definitions', 'escalation_rules.sla_definition_id', 'sla_definitions.id')
      .select('escalation_rules.*', 'sla_definitions.name as sla_name');
    if (filters.entity_type) qb = qb.where('escalation_rules.entity_type', filters.entity_type);
    if (filters.is_active !== undefined) qb = qb.where('escalation_rules.is_active', filters.is_active === 'true');
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

  async findRuleById(id: string): Promise<EscalationRule> {
    const db = getDatabase();
    const rule = await db('escalation_rules')
      .leftJoin('sla_definitions', 'escalation_rules.sla_definition_id', 'sla_definitions.id')
      .select('escalation_rules.*', 'sla_definitions.name as sla_name')
      .where('escalation_rules.id', id)
      .first();
    if (!rule) throw new NotFoundError('Escalation rule not found');
    return rule;
  }

  async updateRule(id: string, data: UpdateEscalationRuleDTO): Promise<EscalationRule> {
    const db = getDatabase();
    const existing = await db('escalation_rules').where({ id }).first();
    if (!existing) throw new NotFoundError('Escalation rule not found');
    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    const fields: (keyof UpdateEscalationRuleDTO)[] = ['name', 'trigger_after_minutes', 'escalate_to_role', 'escalate_to_user', 'notify', 'is_active'];
    for (const field of fields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    const [rule] = await db('escalation_rules').where({ id }).update(updateData).returning('*');
    return rule;
  }

  async deleteRule(id: string): Promise<void> {
    const db = getDatabase();
    const existing = await db('escalation_rules').where({ id }).first();
    if (!existing) throw new NotFoundError('Escalation rule not found');
    await db('escalation_rules').where({ id }).del();
  }

  async triggerEscalation(breachId: string): Promise<void> {
    const db = getDatabase();
    const breach = await db('sla_breaches').where({ id: breachId }).first();
    if (!breach) throw new NotFoundError('SLA breach not found');
    if (breach.status !== 'open') return;

    const rules = await db('escalation_rules')
      .where({
        entity_type: breach.entity_type,
        is_active: true,
      })
      .andWhere('trigger_after_minutes', '>', 0);

    for (const rule of rules) {
      const existing = await db('escalation_instances')
        .where({ escalation_rule_id: rule.id, sla_breach_id: breachId })
        .first();
      if (existing) continue;

      await db('escalation_instances').insert({
        escalation_rule_id: rule.id,
        sla_breach_id: breachId,
        entity_type: breach.entity_type,
        entity_id: breach.entity_id,
        escalated_to: rule.escalate_to_user || null,
        status: 'triggered',
      });
    }

    await db('sla_breaches').where({ id: breachId }).update({ status: 'escalated' });
  }
}

export const escalationService = new EscalationService();
