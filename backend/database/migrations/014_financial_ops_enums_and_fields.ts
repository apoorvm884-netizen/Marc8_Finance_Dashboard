import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add REFUNDED to booking_status
  await knex.schema.raw(`
    ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'REFUNDED'
  `);

  // Create payment_status enum
  const hasPaymentEnum = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') as exists`
  );
  if (!hasPaymentEnum.rows[0].exists) {
    await knex.schema.raw(`
      CREATE TYPE payment_status AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'REFUNDED')
    `);
  }

  // Add new columns to bookings
  await knex.schema.alterTable('bookings', (table) => {
    table.decimal('discount', 12, 2).notNullable().defaultTo(0);
    table.decimal('taxes', 12, 2).notNullable().defaultTo(0);
    table.decimal('refund', 12, 2).notNullable().defaultTo(0);
    table.string('customer_name', 200);
    table.specificType('payment_status', 'payment_status').notNullable().defaultTo('PENDING');
  });

  // Add reference_number and description to journal_entries
  await knex.schema.alterTable('journal_entries', (table) => {
    table.string('reference_number', 100);
    table.text('description');
  });

  // Add deleted_by to bookings, journal_entries, expenses
  await knex.schema.alterTable('bookings', (table) => {
    table.uuid('deleted_by');
  });

  await knex.schema.alterTable('journal_entries', (table) => {
    table.uuid('deleted_by');
  });

  await knex.schema.alterTable('expenses', (table) => {
    table.uuid('deleted_by');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('bookings', (table) => {
    table.dropColumn('discount');
    table.dropColumn('taxes');
    table.dropColumn('refund');
    table.dropColumn('customer_name');
    table.dropColumn('payment_status');
    table.dropColumn('deleted_by');
  });

  await knex.schema.alterTable('journal_entries', (table) => {
    table.dropColumn('reference_number');
    table.dropColumn('description');
    table.dropColumn('deleted_by');
  });

  await knex.schema.alterTable('expenses', (table) => {
    table.dropColumn('deleted_by');
  });
}
