import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('vehicles', (table) => {
    table.string('fleet_code', 50).unique();
    table.string('variant', 100);
    table.integer('seating_capacity');
    table.string('chassis_number', 100);
    table.string('engine_number', 100);
    table.date('insurance_expiry');
    table.date('permit_expiry');
    table.date('road_tax_expiry');
    table.date('pollution_expiry');
    table.date('fitness_expiry');
    table.date('rc_expiry');
    table.text('photo');
    table.uuid('deleted_by');
  });

  await knex.schema.raw(
    `CREATE INDEX idx_vehicles_fleet_code ON vehicles(fleet_code)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_vehicles_insurance_expiry ON vehicles(insurance_expiry)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_vehicles_fitness_expiry ON vehicles(fitness_expiry)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_vehicles_pollution_expiry ON vehicles(pollution_expiry)`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('vehicles', (table) => {
    table.dropColumn('fleet_code');
    table.dropColumn('variant');
    table.dropColumn('seating_capacity');
    table.dropColumn('chassis_number');
    table.dropColumn('engine_number');
    table.dropColumn('insurance_expiry');
    table.dropColumn('permit_expiry');
    table.dropColumn('road_tax_expiry');
    table.dropColumn('pollution_expiry');
    table.dropColumn('fitness_expiry');
    table.dropColumn('rc_expiry');
    table.dropColumn('photo');
    table.dropColumn('deleted_by');
  });
}
