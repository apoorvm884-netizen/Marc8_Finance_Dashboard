import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import type {
  WorkflowDefinition, WorkflowInstance, WorkflowLog,
  CreateWorkflowDefinitionDTO, UpdateWorkflowDefinitionDTO, TransitionWorkflowDTO,
  PaginationMeta,
} from '../types';
import { activityService } from './activity.service';

const ALLOWED_SORT_FIELDS = ['created_at', 'updated_at', 'name', 'entity_type'] as const;

export class WorkflowService {
  async createDefinition(data: CreateWorkflowDefinitionDTO, createdBy?: string): Promise<WorkflowDefinition> {
    const db = getDatabase();
    const existing = await db('workflow_definitions')
      .where({ entity_type: data.entity_type, name: data.name }).first();
    if (existing) throw new ConflictError('Workflow definition already exists for this entity type');
    const [record] = await db('workflow_definitions').insert({
      entity_type: data.entity_type,
      name: data.name,
      states: JSON.stringify(data.states),
      transitions: JSON.stringify(data.transitions),
      created_by: createdBy || null,
    }).returning('*');
    return record;
  }

  async findAllDefinitions(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['entity_type', 'search']);
    let qb = db('workflow_definitions').whereNull('workflow_definitions.deleted_at');
    if (filters.entity_type) qb = qb.where('entity_type', filters.entity_type);
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

  async findDefinitionById(id: string): Promise<WorkflowDefinition> {
    const db = getDatabase();
    const record = await db('workflow_definitions').where({ id }).first();
    if (!record) throw new NotFoundError('Workflow definition not found');
    return record;
  }

  async updateDefinition(id: string, data: UpdateWorkflowDefinitionDTO, updatedBy?: string): Promise<WorkflowDefinition> {
    const db = getDatabase();
    const existing = await db('workflow_definitions').where({ id }).first();
    if (!existing) throw new NotFoundError('Workflow definition not found');
    const updateData: Record<string, unknown> = { updated_at: db.fn.now(), updated_by: updatedBy || null };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.states !== undefined) updateData.states = JSON.stringify(data.states);
    if (data.transitions !== undefined) updateData.transitions = JSON.stringify(data.transitions);
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    const [record] = await db('workflow_definitions').where({ id }).update(updateData).returning('*');
    return record;
  }

  async deleteDefinition(id: string): Promise<void> {
    const db = getDatabase();
    const existing = await db('workflow_definitions').where({ id }).first();
    if (!existing) throw new NotFoundError('Workflow definition not found');
    const hasInstances = await db('workflow_instances').where({ workflow_definition_id: id }).first();
    if (hasInstances) throw new ValidationError('Cannot delete workflow definition with active instances');
    await db('workflow_definitions').where({ id }).del();
  }

  private async getOrCreateInstance(entityType: string, entityId: string, definitionId: string, createdBy?: string): Promise<WorkflowInstance> {
    const db = getDatabase();
    let instance = await db('workflow_instances')
      .where({ entity_type: entityType, entity_id: entityId }).first();
    if (!instance) {
      [instance] = await db('workflow_instances').insert({
        workflow_definition_id: definitionId,
        entity_type: entityType,
        entity_id: entityId,
        current_state: 'pending',
        created_by: createdBy || null,
      }).returning('*');
    }
    return instance;
  }

  async transition(entityType: string, entityId: string, data: TransitionWorkflowDTO, userId?: string): Promise<{ instance: WorkflowInstance; log: WorkflowLog }> {
    const db = getDatabase();
    const definition = await db('workflow_definitions')
      .where({ entity_type: entityType, is_active: true }).first();
    if (!definition) throw new NotFoundError(`No active workflow definition for entity type: ${entityType}`);

    const transitions: Array<{ from_state: string; to_state: string; action: string }> = definition.transitions;
    const validTransition = transitions.find(t =>
      t.action === data.action
    );
    if (!validTransition) throw new ValidationError(`Invalid action "${data.action}" for entity type "${entityType}"`);

    let instance = await db('workflow_instances')
      .where({ entity_type: entityType, entity_id: entityId }).first();
    if (!instance) {
      [instance] = await db('workflow_instances').insert({
        workflow_definition_id: definition.id,
        entity_type: entityType,
        entity_id: entityId,
        current_state: validTransition.from_state,
        created_by: userId || null,
      }).returning('*');
    }

    if (instance.current_state !== validTransition.from_state && validTransition.from_state !== '*') {
      const wildcard = transitions.find(t => t.action === data.action && t.from_state === '*');
      if (!wildcard) {
        throw new ValidationError(
          `Cannot transition from "${instance.current_state}" using action "${data.action}". Valid from state: "${validTransition.from_state}"`
        );
      }
    }

    const fromState = instance.current_state;
    const [log] = await db('workflow_log').insert({
      workflow_instance_id: instance.id,
      from_state: fromState,
      to_state: validTransition.to_state,
      action: data.action,
      comment: data.comment || null,
      performed_by: userId || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    }).returning('*');

    [instance] = await db('workflow_instances').where({ id: instance.id }).update({
      current_state: validTransition.to_state,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      updated_at: db.fn.now(),
      updated_by: userId || null,
    }).returning('*');

    await activityService.log({
      entity_type: entityType,
      entity_id: entityId,
      action: `status_changed:${data.action}`,
      description: `State changed from ${fromState} to ${validTransition.to_state}`,
      old_values: { state: fromState },
      new_values: { state: validTransition.to_state },
      performed_by: userId,
      metadata: { workflow_instance_id: instance.id, action: data.action },
    });

    return { instance, log };
  }

  async getInstanceHistory(entityType: string, entityId: string): Promise<WorkflowLog[]> {
    const db = getDatabase();
    const instance = await db('workflow_instances')
      .where({ entity_type: entityType, entity_id: entityId }).first();
    if (!instance) return [];
    return db('workflow_log')
      .where({ workflow_instance_id: instance.id })
      .leftJoin('users', 'workflow_log.performed_by', 'users.id')
      .select('workflow_log.*', db.raw("CONCAT(users.first_name, ' ', users.last_name) as performed_by_name"))
      .orderBy('created_at', 'asc');
  }

  async getActiveInstances(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['entity_type', 'current_state']);
    let qb = db('workflow_instances');
    if (filters.entity_type) qb = qb.where('entity_type', filters.entity_type);
    if (filters.current_state) qb = qb.where('current_state', filters.current_state);
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

  async seedDefaultDefinitions(): Promise<void> {
    const db = getDatabase();
    const existing = await db('workflow_definitions').first();
    if (existing) return;

    const definitions = [
      {
        entity_type: 'expense',
        name: 'Expense Approval Workflow',
        states: [
          { name: 'pending', label: 'Pending', description: 'Awaiting approval' },
          { name: 'approved', label: 'Approved', description: 'Approved for payment', color: '#22c55e' },
          { name: 'rejected', label: 'Rejected', description: 'Rejected', color: '#ef4444' },
          { name: 'reimbursed', label: 'Reimbursed', description: 'Payment completed', color: '#3b82f6' },
        ],
        transitions: [
          { from_state: 'pending', to_state: 'approved', action: 'approve', label: 'Approve', required_role: 'manager', requires_approval: true },
          { from_state: 'pending', to_state: 'rejected', action: 'reject', label: 'Reject', required_role: 'manager', requires_approval: true },
          { from_state: 'approved', to_state: 'reimbursed', action: 'reimburse', label: 'Mark Reimbursed', required_role: 'admin' },
        ],
      },
      {
        entity_type: 'settlement',
        name: 'Settlement Approval Workflow',
        states: [
          { name: 'draft', label: 'Draft', description: 'Settlement generated', color: '#6b7280' },
          { name: 'pending_approval', label: 'Pending Approval', description: 'Awaiting approval' },
          { name: 'approved', label: 'Approved', description: 'Approved for payment', color: '#22c55e' },
          { name: 'rejected', label: 'Rejected', description: 'Rejected', color: '#ef4444' },
          { name: 'paid', label: 'Paid', description: 'Payment completed', color: '#3b82f6' },
        ],
        transitions: [
          { from_state: 'draft', to_state: 'pending_approval', action: 'submit', label: 'Submit for Approval' },
          { from_state: 'pending_approval', to_state: 'approved', action: 'approve', label: 'Approve', required_role: 'admin', requires_approval: true },
          { from_state: 'pending_approval', to_state: 'rejected', action: 'reject', label: 'Reject', required_role: 'admin', requires_approval: true },
          { from_state: 'approved', to_state: 'paid', action: 'process_payment', label: 'Process Payment', required_role: 'admin' },
        ],
      },
    ];

    for (const def of definitions) {
      await db('workflow_definitions').insert({
        entity_type: def.entity_type,
        name: def.name,
        states: JSON.stringify(def.states),
        transitions: JSON.stringify(def.transitions),
        is_active: true,
      });
    }
  }
}

export const workflowService = new WorkflowService();
