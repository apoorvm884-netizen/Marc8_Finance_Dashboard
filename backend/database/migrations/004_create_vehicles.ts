import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasEnum = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') as exists`
  );

  if (!hasEnum.rows[0].exists) {
    await knex.schema.raw(
      `CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE')`
    );
  }

  await knex.schema.createTable('vehicles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('vehicle_number', 50).unique().notNullable();
    table.string('vehicle_name', 200).notNullable();
    table.string('brand', 100);
    table.string('model', 100);
    table.integer('year');
    table.string('color', 50);
    table.string('fuel_type', 20);
    table.string('transmission', 20);
    table.string('ownership_type', 20);
    table.specificType('status', 'vehicle_status').notNullable().defaultTo('AVAILABLE');
    table.uuid('active_platform_id');
    table.date('purchase_date');
    table.decimal('purchase_price', 12, 2);
    table.integer('current_odometer').defaultTo(0);
    table.text('notes');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
    table.timestamp('deleted_at');
    table.uuid('created_by');
    table.uuid('updated_by');

    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('updated_by').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.raw(
    `CREATE INDEX idx_vehicles_vehicle_number ON vehicles(vehicle_number)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_vehicles_status ON vehicles(status)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_vehicles_is_active ON vehicles(is_active)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_vehicles_deleted_at ON vehicles(deleted_at) WHERE deleted_at IS NOT NULL`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('vehicles');
  await knex.schema.raw('DROP TYPE IF EXISTS vehicle_status');
}
