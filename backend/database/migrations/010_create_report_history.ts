import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('report_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('report_type', 100).notNullable();
    table.jsonb('filters').notNullable().defaultTo('{}');
    table.string('status', 50).notNullable().defaultTo('GENERATED');
    table.timestamps(true, true);
    table.uuid('generated_by');

    table.foreign('generated_by').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.raw(`CREATE INDEX idx_report_history_generated_by ON report_history(generated_by)`);
  await knex.schema.raw(`CREATE INDEX idx_report_history_report_type ON report_history(report_type)`);
  await knex.schema.raw(`CREATE INDEX idx_report_history_created_at ON report_history(created_at)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('report_history');
}
