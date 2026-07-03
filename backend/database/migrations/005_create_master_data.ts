import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('master_types', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('code', 50).unique().notNullable();
    table.string('name', 200).notNullable();
    table.text('description');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('master_values', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('master_type_id').notNullable();
    table.string('code', 50).notNullable();
    table.string('name', 200).notNullable();
    table.text('description');
    table.integer('display_order').defaultTo(0);
    table.string('color', 7);
    table.string('icon', 50);
    table.boolean('is_system').notNullable().defaultTo(false);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
    table.timestamp('deleted_at');

    table.foreign('master_type_id').references('id').inTable('master_types').onDelete('CASCADE');
    table.unique(['master_type_id', 'code']);
  });

  await knex.schema.raw(
    `CREATE INDEX idx_master_values_master_type_id ON master_values(master_type_id)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_master_values_code ON master_values(code)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_master_values_display_order ON master_values(display_order)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_master_values_deleted_at ON master_values(deleted_at) WHERE deleted_at IS NOT NULL`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('master_values');
  await knex.schema.dropTableIfExists('master_types');
}
