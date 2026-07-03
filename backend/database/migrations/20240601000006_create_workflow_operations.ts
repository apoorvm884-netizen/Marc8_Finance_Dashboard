import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // ===================== WORKFLOW ENGINE =====================
  await knex.schema.createTable('workflow_definitions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('entity_type', 100).notNullable();
    table.string('name', 255).notNullable();
    table.jsonb('states').notNullable().defaultTo('[]');
    table.jsonb('transitions').notNullable().defaultTo('[]');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.unique(['entity_type', 'name']);
  });

  await knex.schema.createTable('workflow_instances', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('workflow_definition_id').notNullable().references('id').inTable('workflow_definitions');
    table.string('entity_type', 100).notNullable();
    table.uuid('entity_id').notNullable();
    table.string('current_state', 100).notNullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.index(['entity_type', 'entity_id']);
  });

  await knex.schema.createTable('workflow_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('workflow_instance_id').notNullable().references('id').inTable('workflow_instances').onDelete('CASCADE');
    table.string('from_state', 100).nullable();
    table.string('to_state', 100).notNullable();
    table.string('action', 100).notNullable();
    table.text('comment').nullable();
    table.uuid('performed_by').nullable().references('id').inTable('users');
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('workflow_instance_id');
  });

  // ===================== APPROVAL ENGINE =====================
  await knex.schema.createTable('approval_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('entity_type', 100).notNullable();
    table.uuid('entity_id').notNullable();
    table.string('request_type', 100).notNullable();
    table.string('status', 50).notNullable().defaultTo('pending');
    table.uuid('requested_by').nullable().references('id').inTable('users');
    table.integer('level').defaultTo(1);
    table.integer('max_level').defaultTo(1);
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['entity_type', 'entity_id']);
    table.index('status');
  });

  await knex.schema.createTable('approval_levels', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('approval_request_id').notNullable().references('id').inTable('approval_requests').onDelete('CASCADE');
    table.integer('level_number').notNullable();
    table.jsonb('required_roles').nullable();
    table.jsonb('required_users').nullable();
    table.jsonb('actual_approvers').nullable();
    table.string('status', 50).notNullable().defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.unique(['approval_request_id', 'level_number']);
  });

  await knex.schema.createTable('approval_actions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('approval_level_id').notNullable().references('id').inTable('approval_levels').onDelete('CASCADE');
    table.uuid('approval_request_id').notNullable().references('id').inTable('approval_requests').onDelete('CASCADE');
    table.string('action', 50).notNullable();
    table.text('comment').nullable();
    table.uuid('performed_by').nullable().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('approval_request_id');
  });

  // ===================== TASK ENGINE =====================
  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('entity_type', 100).nullable();
    table.uuid('entity_id').nullable();
    table.string('title', 500).notNullable();
    table.text('description').nullable();
    table.uuid('assigned_to').nullable().references('id').inTable('users');
    table.uuid('assigned_by').nullable().references('id').inTable('users');
    table.string('priority', 50).notNullable().defaultTo('normal');
    table.string('status', 50).notNullable().defaultTo('pending');
    table.timestamp('due_at').nullable();
    table.timestamp('completed_at').nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.uuid('deleted_by').nullable().references('id').inTable('users');
    table.index(['entity_type', 'entity_id']);
    table.index('assigned_to');
    table.index('status');
  });

  await knex.schema.createTable('task_comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('task_id').notNullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.text('comment').notNullable();
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('task_id');
  });

  // ===================== SLA ENGINE =====================
  await knex.schema.createTable('sla_definitions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('entity_type', 100).notNullable();
    table.string('name', 255).notNullable();
    table.string('from_status', 100).nullable();
    table.string('to_status', 100).notNullable();
    table.integer('sla_hours').notNullable();
    table.string('severity', 50).notNullable().defaultTo('medium');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.unique(['entity_type', 'from_status', 'to_status']);
  });

  await knex.schema.createTable('sla_breaches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('sla_definition_id').notNullable().references('id').inTable('sla_definitions');
    table.string('entity_type', 100).notNullable();
    table.uuid('entity_id').notNullable();
    table.timestamp('expected_at').notNullable();
    table.timestamp('breached_at').nullable();
    table.string('status', 50).notNullable().defaultTo('open');
    table.timestamp('resolved_at').nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['entity_type', 'entity_id']);
    table.index('status');
  });

  // ===================== ESCALATION ENGINE =====================
  await knex.schema.createTable('escalation_rules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('sla_definition_id').nullable().references('id').inTable('sla_definitions');
    table.string('entity_type', 100).notNullable();
    table.string('name', 255).notNullable();
    table.integer('trigger_after_minutes').notNullable();
    table.string('escalate_to_role', 50).nullable();
    table.uuid('escalate_to_user').nullable().references('id').inTable('users');
    table.boolean('notify').defaultTo(true);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('escalation_instances', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('escalation_rule_id').notNullable().references('id').inTable('escalation_rules');
    table.uuid('sla_breach_id').nullable().references('id').inTable('sla_breaches');
    table.string('entity_type', 100).notNullable();
    table.uuid('entity_id').notNullable();
    table.uuid('escalated_to').nullable().references('id').inTable('users');
    table.uuid('escalated_by').nullable().references('id').inTable('users');
    table.string('status', 50).notNullable().defaultTo('triggered');
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['entity_type', 'entity_id']);
    table.index('status');
  });

  // ===================== ACTIVITY TIMELINE =====================
  await knex.schema.createTable('activity_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('entity_type', 100).notNullable();
    table.uuid('entity_id').notNullable();
    table.string('action', 100).notNullable();
    table.text('description').nullable();
    table.jsonb('old_values').nullable();
    table.jsonb('new_values').nullable();
    table.uuid('performed_by').nullable().references('id').inTable('users');
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['entity_type', 'entity_id', 'created_at']);
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('activity_log');
  await knex.schema.dropTableIfExists('escalation_instances');
  await knex.schema.dropTableIfExists('escalation_rules');
  await knex.schema.dropTableIfExists('sla_breaches');
  await knex.schema.dropTableIfExists('sla_definitions');
  await knex.schema.dropTableIfExists('task_comments');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('approval_actions');
  await knex.schema.dropTableIfExists('approval_levels');
  await knex.schema.dropTableIfExists('approval_requests');
  await knex.schema.dropTableIfExists('workflow_log');
  await knex.schema.dropTableIfExists('workflow_instances');
  await knex.schema.dropTableIfExists('workflow_definitions');
}
