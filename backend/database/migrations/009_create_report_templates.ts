import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('report_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('report_type', 100).notNullable();
    table.jsonb('filters').notNullable().defaultTo('{}');
    table.boolean('is_favorite').notNullable().defaultTo(false);
    table.timestamps(true, true);
    table.uuid('created_by');

    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.raw(`CREATE INDEX idx_report_templates_created_by ON report_templates(created_by)`);
  await knex.schema.raw(`CREATE INDEX idx_report_templates_report_type ON report_templates(report_type)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('report_templates');
}
