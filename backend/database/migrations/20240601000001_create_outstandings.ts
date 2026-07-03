import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('outstandings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.uuid('outstanding_category_id').notNullable().references('id').inTable('master_values');
    table.uuid('vehicle_id').nullable().references('id').inTable('vehicles');
    table.uuid('platform_id').nullable().references('id').inTable('master_values');
    table.string('vendor', 255).nullable();
    table.decimal('amount', 12, 2).notNullable();
    table.date('due_date').notNullable();
    table.string('priority', 20).notNullable().defaultTo('normal');
    table.string('status', 20).notNullable().defaultTo('upcoming');
    table.text('notes').nullable();
    table.uuid('paid_as_expense_id').nullable().references('id').inTable('expenses');
    table.decimal('paid_amount', 12, 2).nullable();
    table.timestamp('paid_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.uuid('deleted_by').nullable().references('id').inTable('users');
  });

  await knex('master_types').insert([
    { code: 'outstanding_category', name: 'Outstanding Categories', description: 'Categories for outstanding liabilities', is_active: true },
    { code: 'outstanding_priority', name: 'Outstanding Priorities', description: 'Priority levels for outstanding items', is_active: true },
    { code: 'platform_category', name: 'Platform Categories', description: 'Categories for booking platforms', is_active: true },
  ]);

  const getMT = async (code: string) => knex('master_types').where({ code }).first();

  const outstandingCatMT = await getMT('outstanding_category');
  const priorityMT = await getMT('outstanding_priority');
  const platformCatMT = await getMT('platform_category');

  if (outstandingCatMT) {
    const cats = [
      { code: 'insurance_due', name: 'Insurance Due', display_order: 1, color: '#ef4444', is_system: true },
      { code: 'emi_due', name: 'EMI Due', display_order: 2, color: '#f97316', is_system: true },
      { code: 'driver_salary', name: 'Driver Salary Due', display_order: 3, color: '#eab308', is_system: true },
      { code: 'vendor_payment', name: 'Vendor Payment', display_order: 4, color: '#22c55e', is_system: true },
      { code: 'office_rent', name: 'Office Rent', display_order: 5, color: '#06b6d4', is_system: true },
      { code: 'road_tax', name: 'Road Tax', display_order: 6, color: '#8b5cf6', is_system: true },
      { code: 'fitness', name: 'Fitness', display_order: 7, color: '#ec4899', is_system: true },
      { code: 'pollution', name: 'Pollution', display_order: 8, color: '#14b8a6', is_system: true },
      { code: 'permit_renewal', name: 'Permit Renewal', display_order: 9, color: '#f43f5e', is_system: true },
      { code: 'rc_renewal', name: 'RC Renewal', display_order: 10, color: '#6366f1', is_system: true },
      { code: 'other', name: 'Other', display_order: 99, color: '#64748b', is_system: true },
    ];
    for (const cat of cats) {
      await knex('master_values').insert({
        master_type_id: outstandingCatMT.id,
        ...cat,
        is_active: true,
      });
    }
  }

  if (priorityMT) {
    const priorities = [
      { code: 'low', name: 'Low', display_order: 1, color: '#22c55e', is_system: true },
      { code: 'normal', name: 'Normal', display_order: 2, color: '#3b82f6', is_system: true },
      { code: 'high', name: 'High', display_order: 3, color: '#f97316', is_system: true },
      { code: 'urgent', name: 'Urgent', display_order: 4, color: '#ef4444', is_system: true },
    ];
    for (const p of priorities) {
      await knex('master_values').insert({
        master_type_id: priorityMT.id,
        ...p,
        is_active: true,
      });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('outstandings');
  await knex('master_values').whereIn('master_type_id', function () {
    this.select('id').from('master_types').whereIn('code', ['outstanding_category', 'outstanding_priority', 'platform_category']);
  }).del();
  await knex('master_types').whereIn('code', ['outstanding_category', 'outstanding_priority', 'platform_category']).del();
}
