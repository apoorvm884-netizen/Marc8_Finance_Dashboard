import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasEnum = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') as exists`
  );

  if (!hasEnum.rows[0].exists) {
    await knex.schema.raw(
      `CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')`
    );
  }

  await knex.schema.createTable('bookings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vehicle_id').notNullable();
    table.uuid('platform_id').notNullable();
    table.string('booking_id', 255).unique().notNullable();
    table.timestamp('booking_date_time', { useTz: true }).notNullable();
    table.timestamp('trip_start', { useTz: true });
    table.timestamp('trip_end', { useTz: true });
    table.decimal('gross_fare', 12, 2).notNullable().defaultTo(0);
    table.decimal('doorstep_charges', 12, 2).notNullable().defaultTo(0);
    table.decimal('platform_commission', 12, 2).notNullable().defaultTo(0);
    table.decimal('net_revenue', 12, 2).notNullable().defaultTo(0);
    table.specificType('status', 'booking_status').notNullable().defaultTo('PENDING');
    table.text('remarks');
    table.timestamps(true, true);
    table.timestamp('deleted_at');
    table.uuid('created_by');
    table.uuid('updated_by');

    table.foreign('vehicle_id').references('id').inTable('vehicles').onDelete('RESTRICT');
    table.foreign('platform_id').references('id').inTable('master_values').onDelete('RESTRICT');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('updated_by').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.raw(`CREATE INDEX idx_bookings_booking_id ON bookings(booking_id)`);
  await knex.schema.raw(`CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id)`);
  await knex.schema.raw(`CREATE INDEX idx_bookings_platform_id ON bookings(platform_id)`);
  await knex.schema.raw(`CREATE INDEX idx_bookings_status ON bookings(status)`);
  await knex.schema.raw(`CREATE INDEX idx_bookings_booking_date_time ON bookings(booking_date_time)`);
  await knex.schema.raw(
    `CREATE INDEX idx_bookings_deleted_at ON bookings(deleted_at) WHERE deleted_at IS NOT NULL`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bookings');
  await knex.schema.raw('DROP TYPE IF EXISTS booking_status');
}
