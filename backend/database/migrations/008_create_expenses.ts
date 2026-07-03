import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasEnum = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_status') as exists`
  );

  if (!hasEnum.rows[0].exists) {
    await knex.schema.raw(
      `CREATE TYPE expense_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED')`
    );
  }

  await knex.schema.createTable('expenses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vehicle_id');
    table.uuid('expense_category_id').notNullable();
    table.uuid('payment_mode_id').notNullable();
    table.timestamp('expense_date', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.decimal('amount', 12, 2).notNullable().defaultTo(0);
    table.string('vendor', 255);
    table.string('invoice_number', 255);
    table.text('remarks');
    table.specificType('status', 'expense_status').notNullable().defaultTo('PENDING');
    table.timestamps(true, true);
    table.timestamp('deleted_at');
    table.uuid('created_by');
    table.uuid('updated_by');

    table.foreign('vehicle_id').references('id').inTable('vehicles').onDelete('SET NULL');
    table.foreign('expense_category_id').references('id').inTable('master_values').onDelete('RESTRICT');
    table.foreign('payment_mode_id').references('id').inTable('master_values').onDelete('RESTRICT');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('updated_by').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.raw(`CREATE INDEX idx_expenses_vehicle_id ON expenses(vehicle_id)`);
  await knex.schema.raw(`CREATE INDEX idx_expenses_category_id ON expenses(expense_category_id)`);
  await knex.schema.raw(`CREATE INDEX idx_expenses_payment_mode_id ON expenses(payment_mode_id)`);
  await knex.schema.raw(`CREATE INDEX idx_expenses_status ON expenses(status)`);
  await knex.schema.raw(`CREATE INDEX idx_expenses_expense_date ON expenses(expense_date)`);
  await knex.schema.raw(`CREATE INDEX idx_expenses_deleted_at ON expenses(deleted_at) WHERE deleted_at IS NOT NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('expenses');
  await knex.schema.raw('DROP TYPE IF EXISTS expense_status');
}
