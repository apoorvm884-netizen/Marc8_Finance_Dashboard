import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('automation_rules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.string('event_type', 100).nullable();
    table.jsonb('conditions').nullable().defaultTo('[]');
    table.jsonb('actions').notNullable().defaultTo('[]');
    table.jsonb('schedule_config').nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('priority').defaultTo(0);
    table.integer('cooldown_minutes').defaultTo(0);
    table.integer('max_executions').defaultTo(0);
    table.integer('execution_count').defaultTo(0);
    table.timestamp('last_executed_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
  });

  await knex.schema.createTable('automation_executions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('automation_rule_id').notNullable().references('id').inTable('automation_rules').onDelete('CASCADE');
    table.string('event_type', 100).nullable();
    table.string('entity_type', 100).nullable();
    table.uuid('entity_id').nullable();
    table.string('status', 50).notNullable().defaultTo('pending');
    table.string('trigger_type', 50).notNullable().defaultTo('manual');
    table.jsonb('result').nullable();
    table.text('error_message').nullable();
    table.timestamp('started_at').nullable();
    table.timestamp('completed_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['automation_rule_id', 'created_at']);
    table.index('status');
  });

  await knex.schema.createTable('scheduled_jobs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.uuid('automation_rule_id').nullable().references('id').inTable('automation_rules');
    table.string('job_type', 100).notNullable();
    table.string('schedule_type', 50).notNullable();
    table.string('cron_expression', 100).nullable();
    table.jsonb('schedule_config').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_run_at').nullable();
    table.timestamp('next_run_at').nullable();
    table.boolean('retry_on_failure').defaultTo(true);
    table.integer('max_retries').defaultTo(3);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index('next_run_at');
    table.index('is_active');
  });

  await knex.schema.createTable('scheduled_job_executions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('scheduled_job_id').notNullable().references('id').inTable('scheduled_jobs').onDelete('CASCADE');
    table.string('status', 50).notNullable().defaultTo('running');
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at').nullable();
    table.jsonb('result').nullable();
    table.text('error_message').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['scheduled_job_id', 'created_at']);
  });

  await knex.schema.createTable('business_alerts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('alert_type', 100).notNullable();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.string('severity', 50).notNullable().defaultTo('info');
    table.string('entity_type', 100).nullable();
    table.uuid('entity_id').nullable();
    table.boolean('is_read').defaultTo(false);
    table.boolean('is_dismissed').defaultTo(false);
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.index(['alert_type', 'created_at']);
    table.index('severity');
    table.index('is_dismissed');
  });

  await knex.schema.createTable('recommendations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('recommendation_type', 100).notNullable();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.string('priority', 50).notNullable().defaultTo('medium');
    table.string('entity_type', 100).nullable();
    table.uuid('entity_id').nullable();
    table.jsonb('supporting_data').nullable();
    table.string('status', 50).notNullable().defaultTo('open');
    table.timestamp('actioned_at').nullable();
    table.uuid('actioned_by').nullable().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['recommendation_type', 'created_at']);
    table.index('status');
    table.index('priority');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('recommendations');
  await knex.schema.dropTableIfExists('business_alerts');
  await knex.schema.dropTableIfExists('scheduled_job_executions');
  await knex.schema.dropTableIfExists('scheduled_jobs');
  await knex.schema.dropTableIfExists('automation_executions');
  await knex.schema.dropTableIfExists('automation_rules');
}
