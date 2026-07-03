import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasEnum = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') as exists`
  );

  if (!hasEnum.rows[0].exists) {
    await knex.schema.raw(
      `CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CHANGE_PASSWORD', 'ACTIVATE', 'DEACTIVATE', 'EXPORT', 'IMPORT')`
    );
  }

  const hasEntityEnum = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_entity') as exists`
  );

  if (!hasEntityEnum.rows[0].exists) {
    await knex.schema.raw(
      `CREATE TYPE audit_entity AS ENUM ('USER', 'SESSION', 'VEHICLE', 'BOOKING', 'EXPENSE', 'MAINTENANCE', 'FUEL', 'INSURANCE', 'INVOICE', 'PAYMENT', 'REPORT', 'SETTINGS')`
    );
  }

  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.specificType('action', 'audit_action').notNullable();
    table.specificType('entity_type', 'audit_entity').notNullable();
    table.string('entity_id', 100);
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.text('description');
    table.string('ip_address', 45);
    table.string('user_agent', 500);
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    table.index('user_id', 'idx_audit_logs_user_id');
    table.index('action', 'idx_audit_logs_action');
    table.index('entity_type', 'idx_audit_logs_entity_type');
    table.index('entity_id', 'idx_audit_logs_entity_id');
    table.index('created_at', 'idx_audit_logs_created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.raw('DROP TYPE IF EXISTS audit_entity');
  await knex.schema.raw('DROP TYPE IF EXISTS audit_action');
}
