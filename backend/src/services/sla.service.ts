import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import type { SLADefinition, SLABreach, CreateSLADefinitionDTO, UpdateSLADefinitionDTO, PaginationMeta } from '../types';

const ALLOWED_SORT_FIELDS = ['created_at', 'updated_at', 'name', 'severity', 'sla_hours'] as const;

export class SLAService {
  async createDefinition(data: CreateSLADefinitionDTO): Promise<SLADefinition> {
    const db = getDatabase();
    const [record] = await db('sla_definitions').insert({
      entity_type: data.entity_type,
      name: data.name,
      from_status: data.from_status || null,
      to_status: data.to_status,
      sla_hours: data.sla_hours,
      severity: data.severity || 'medium',
    }).returning('*');
    return record;
  }

  async findAllDefinitions(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['entity_type', 'is_active']);
    let qb = db('sla_definitions');
    if (filters.entity_type) qb = qb.where('entity_type', filters.entity_type);
    if (filters.is_active !== undefined) qb = qb.where('is_active', filters.is_active === 'true');
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

  async findDefinitionById(id: string): Promise<SLADefinition> {
    const db = getDatabase();
    const record = await db('sla_definitions').where({ id }).first();
    if (!record) throw new NotFoundError('SLA definition not found');
    return record;
  }

  async updateDefinition(id: string, data: UpdateSLADefinitionDTO): Promise<SLADefinition> {
    const db = getDatabase();
    const existing = await db('sla_definitions').where({ id }).first();
    if (!existing) throw new NotFoundError('SLA definition not found');
    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    const fields: (keyof UpdateSLADefinitionDTO)[] = ['name', 'from_status', 'to_status', 'sla_hours', 'severity', 'is_active'];
    for (const field of fields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    const [record] = await db('sla_definitions').where({ id }).update(updateData).returning('*');
    return record;
  }

  async deleteDefinition(id: string): Promise<void> {
    const db = getDatabase();
    const existing = await db('sla_definitions').where({ id }).first();
    if (!existing) throw new NotFoundError('SLA definition not found');
    await db('sla_definitions').where({ id }).del();
  }

  async checkBreaches(): Promise<SLABreach[]> {
    const db = getDatabase();
    const definitions = await db('sla_definitions').where({ is_active: true });
    const breaches: SLABreach[] = [];

    for (const def of definitions) {
      const existingBreach = await db('sla_breaches')
        .where({
          sla_definition_id: def.id,
          status: 'open',
        })
        .first();
      if (existingBreach) continue;

      const [breach] = await db('sla_breaches').insert({
        sla_definition_id: def.id,
        entity_type: def.entity_type,
        entity_id: '00000000-0000-0000-0000-000000000000',
        expected_at: db.fn.now(),
        breached_at: db.fn.now(),
        status: 'open',
      }).returning('*');
      breaches.push(breach);
    }

    return breaches;
  }

  async getBreaches(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, ['created_at', 'status']);
    const filters = parseFilters(query, ['status', 'entity_type']);
    let qb = db('sla_breaches')
      .leftJoin('sla_definitions', 'sla_breaches.sla_definition_id', 'sla_definitions.id')
      .select('sla_breaches.*', 'sla_definitions.name as sla_name', 'sla_definitions.severity', 'sla_definitions.sla_hours');
    if (filters.status) qb = qb.where('sla_breaches.status', filters.status);
    if (filters.entity_type) qb = qb.where('sla_breaches.entity_type', filters.entity_type);
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
}

export const slaService = new SLAService();
