import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Add vehicle columns for service scheduling
  await knex.schema.alterTable('vehicles', (table) => {
    table.integer('service_interval_km').nullable();
    table.integer('service_interval_days').nullable();
    table.integer('next_service_km').nullable();
    table.date('next_service_date').nullable();
    table.decimal('health_score', 5, 2).nullable().defaultTo(100);
  });

  // 2. Vendor master
  await knex.schema.createTable('vendors', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vendor_type_id').references('id').inTable('master_values').nullable();
    table.string('name', 255).notNullable();
    table.string('contact_person', 255).nullable();
    table.string('phone', 50).nullable();
    table.string('email', 255).nullable();
    table.string('gst', 50).nullable();
    table.text('address').nullable();
    table.string('city', 100).nullable();
    table.string('state', 100).nullable();
    table.string('pincode', 20).nullable();
    table.decimal('rating', 2, 1).nullable().defaultTo(0);
    table.text('supported_services').nullable();
    table.text('payment_terms').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.uuid('deleted_by').nullable().references('id').inTable('users');
  });

  // 3. Platform assignments (immutable history)
  await knex.schema.createTable('vehicle_platform_assignments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vehicle_id').notNullable().references('id').inTable('vehicles');
    table.uuid('platform_id').notNullable().references('id').inTable('master_values');
    table.uuid('platform_category_id').nullable().references('id').inTable('master_values');
    table.date('start_date').notNullable();
    table.date('end_date').nullable();
    table.string('status', 20).notNullable().defaultTo('active');
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
  });

  // 4. Maintenance records
  await knex.schema.createTable('maintenance_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vehicle_id').notNullable().references('id').inTable('vehicles');
    table.uuid('vendor_id').nullable().references('id').inTable('vendors');
    table.uuid('maintenance_type_id').notNullable().references('id').inTable('master_values');
    table.date('service_date').notNullable();
    table.integer('odometer_reading').nullable();
    table.text('description').nullable();
    table.decimal('cost', 12, 2).notNullable();
    table.string('vendor_invoice', 255).nullable();
    table.integer('warranty_months').nullable();
    table.string('status', 20).notNullable().defaultTo('completed');
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.uuid('deleted_by').nullable().references('id').inTable('users');
  });

  // 5. Maintenance parts
  await knex.schema.createTable('maintenance_parts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('maintenance_record_id').notNullable().references('id').inTable('maintenance_records');
    table.uuid('part_category_id').nullable().references('id').inTable('master_values');
    table.string('part_name', 255).notNullable();
    table.string('brand', 255).nullable();
    table.string('vendor', 255).nullable();
    table.integer('quantity').defaultTo(1);
    table.decimal('unit_price', 12, 2).notNullable();
    table.decimal('total_price', 12, 2).nullable();
    table.integer('warranty_months').nullable();
    table.string('invoice_number', 255).nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 6. Service schedules
  await knex.schema.createTable('service_schedules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vehicle_id').notNullable().references('id').inTable('vehicles');
    table.string('service_type', 20).notNullable().defaultTo('both');
    table.integer('interval_km').nullable();
    table.integer('interval_days').nullable();
    table.integer('last_service_km').nullable();
    table.date('last_service_date').nullable();
    table.integer('next_service_km').nullable();
    table.date('next_service_date').nullable();
    table.boolean('is_recurring').defaultTo(true);
    table.text('notes').nullable();
    table.string('status', 20).defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.uuid('deleted_by').nullable().references('id').inTable('users');
  });

  // 7. Vehicle timeline events
  await knex.schema.createTable('vehicle_timeline_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vehicle_id').notNullable().references('id').inTable('vehicles');
    table.string('event_type', 50).notNullable();
    table.timestamp('event_date').notNullable();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.string('reference_type', 50).nullable();
    table.uuid('reference_id').nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 8. Seed master data
  const types = [
    { code: 'maintenance_type', name: 'Maintenance Types', description: 'Types of vehicle maintenance', is_active: true },
    { code: 'part_category', name: 'Part Categories', description: 'Categories for replacement parts', is_active: true },
    { code: 'vendor_type', name: 'Vendor Types', description: 'Types of vendors/suppliers', is_active: true },
    { code: 'service_type', name: 'Service Types', description: 'Types of service scheduling', is_active: true },
    { code: 'timeline_event_type', name: 'Timeline Event Types', description: 'Types of vehicle timeline events', is_active: true },
  ];

  for (const t of types) {
    await knex('master_types').insert(t);
  }

  const getMtId = async (code: string) => {
    const mt = await knex('master_types').where({ code }).first();
    return mt?.id;
  };

  // Maintenance type values
  const maintTypeId = await getMtId('maintenance_type');
  if (maintTypeId) {
    const types = [
      { code: 'general_service', name: 'General Service', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'preventive', name: 'Preventive Service', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'breakdown', name: 'Breakdown Repair', display_order: 3, color: '#ef4444', is_system: true, is_active: true },
      { code: 'accident', name: 'Accident Repair', display_order: 4, color: '#f97316', is_system: true, is_active: true },
      { code: 'emergency', name: 'Emergency Repair', display_order: 5, color: '#dc2626', is_system: true, is_active: true },
      { code: 'tyre_change', name: 'Tyre Change', display_order: 6, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'battery', name: 'Battery', display_order: 7, color: '#06b6d4', is_system: true, is_active: true },
      { code: 'oil_change', name: 'Oil Change', display_order: 8, color: '#eab308', is_system: true, is_active: true },
      { code: 'brake', name: 'Brake', display_order: 9, color: '#ec4899', is_system: true, is_active: true },
      { code: 'suspension', name: 'Suspension', display_order: 10, color: '#14b8a6', is_system: true, is_active: true },
      { code: 'electrical', name: 'Electrical', display_order: 11, color: '#6366f1', is_system: true, is_active: true },
      { code: 'body_work', name: 'Body Work', display_order: 12, color: '#f43f5e', is_system: true, is_active: true },
      { code: 'painting', name: 'Painting', display_order: 13, color: '#a855f7', is_system: true, is_active: true },
      { code: 'accessories', name: 'Accessories', display_order: 14, color: '#64748b', is_system: true, is_active: true },
      { code: 'other', name: 'Other', display_order: 99, color: '#94a3b8', is_system: true, is_active: true },
    ];
    for (const v of types) {
      await knex('master_values').insert({ master_type_id: maintTypeId, ...v });
    }
  }

  // Part category values
  const partCatId = await getMtId('part_category');
  if (partCatId) {
    const types = [
      { code: 'engine_oil', name: 'Engine Oil', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'gear_oil', name: 'Gear Oil', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'brake_oil', name: 'Brake Oil', display_order: 3, color: '#ef4444', is_system: true, is_active: true },
      { code: 'coolant', name: 'Coolant', display_order: 4, color: '#06b6d4', is_system: true, is_active: true },
      { code: 'tyres', name: 'Tyres', display_order: 5, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'battery', name: 'Battery', display_order: 6, color: '#f97316', is_system: true, is_active: true },
      { code: 'brake_pads', name: 'Brake Pads', display_order: 7, color: '#ec4899', is_system: true, is_active: true },
      { code: 'air_filter', name: 'Air Filter', display_order: 8, color: '#14b8a6', is_system: true, is_active: true },
      { code: 'fuel_filter', name: 'Fuel Filter', display_order: 9, color: '#eab308', is_system: true, is_active: true },
      { code: 'ac_filter', name: 'AC Filter', display_order: 10, color: '#6366f1', is_system: true, is_active: true },
      { code: 'clutch', name: 'Clutch', display_order: 11, color: '#f43f5e', is_system: true, is_active: true },
      { code: 'suspension_parts', name: 'Suspension', display_order: 12, color: '#a855f7', is_system: true, is_active: true },
      { code: 'spark_plug', name: 'Spark Plug', display_order: 13, color: '#64748b', is_system: true, is_active: true },
      { code: 'bulbs', name: 'Bulbs', display_order: 14, color: '#fbbf24', is_system: true, is_active: true },
      { code: 'other_parts', name: 'Other Parts', display_order: 99, color: '#94a3b8', is_system: true, is_active: true },
    ];
    for (const v of types) {
      await knex('master_values').insert({ master_type_id: partCatId, ...v });
    }
  }

  // Vendor type values
  const vendTypeId = await getMtId('vendor_type');
  if (vendTypeId) {
    const types = [
      { code: 'garage', name: 'Garage', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'mechanic', name: 'Mechanic', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'parts_supplier', name: 'Parts Supplier', display_order: 3, color: '#f97316', is_system: true, is_active: true },
      { code: 'insurance_partner', name: 'Insurance Partner', display_order: 4, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'finance_company', name: 'Finance Company', display_order: 5, color: '#06b6d4', is_system: true, is_active: true },
      { code: 'other_vendor', name: 'Other', display_order: 99, color: '#94a3b8', is_system: true, is_active: true },
    ];
    for (const v of types) {
      await knex('master_values').insert({ master_type_id: vendTypeId, ...v });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('vehicle_timeline_events');
  await knex.schema.dropTableIfExists('service_schedules');
  await knex.schema.dropTableIfExists('maintenance_parts');
  await knex.schema.dropTableIfExists('maintenance_records');
  await knex.schema.dropTableIfExists('vehicle_platform_assignments');
  await knex.schema.dropTableIfExists('vendors');

  await knex.schema.alterTable('vehicles', (table) => {
    table.dropColumn('service_interval_km');
    table.dropColumn('service_interval_days');
    table.dropColumn('next_service_km');
    table.dropColumn('next_service_date');
    table.dropColumn('health_score');
  });

  await knex('master_values').whereIn('master_type_id', function () {
    this.select('id').from('master_types').whereIn('code', ['maintenance_type', 'part_category', 'vendor_type', 'service_type', 'timeline_event_type']);
  }).del();
  await knex('master_types').whereIn('code', ['maintenance_type', 'part_category', 'vendor_type', 'service_type', 'timeline_event_type']).del();
}
