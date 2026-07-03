import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasEnum = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'journal_status') as exists`
  );

  if (!hasEnum.rows[0].exists) {
    await knex.schema.raw(
      `CREATE TYPE journal_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED')`
    );
  }

  await knex.schema.createTable('journal_entries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vehicle_id').notNullable();
    table.timestamp('collection_date', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.decimal('amount_collected', 12, 2).notNullable().defaultTo(0);
    table.decimal('total_amount', 12, 2).notNullable().defaultTo(0);
    table.uuid('ledger_category_id').notNullable();
    table.text('remarks');
    table.specificType('status', 'journal_status').notNullable().defaultTo('PENDING');
    table.timestamps(true, true);
    table.timestamp('deleted_at');
    table.uuid('created_by');
    table.uuid('updated_by');

    table.foreign('vehicle_id').references('id').inTable('vehicles').onDelete('RESTRICT');
    table.foreign('ledger_category_id').references('id').inTable('master_values').onDelete('RESTRICT');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('updated_by').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.raw(`CREATE INDEX idx_journal_entries_vehicle_id ON journal_entries(vehicle_id)`);
  await knex.schema.raw(`CREATE INDEX idx_journal_entries_ledger_category_id ON journal_entries(ledger_category_id)`);
  await knex.schema.raw(`CREATE INDEX idx_journal_entries_status ON journal_entries(status)`);
  await knex.schema.raw(`CREATE INDEX idx_journal_entries_collection_date ON journal_entries(collection_date)`);
  await knex.schema.raw(
    `CREATE INDEX idx_journal_entries_deleted_at ON journal_entries(deleted_at) WHERE deleted_at IS NOT NULL`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('journal_entries');
  await knex.schema.raw('DROP TYPE IF EXISTS journal_status');
}
