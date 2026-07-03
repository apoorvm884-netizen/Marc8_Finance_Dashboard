import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Add revenue model fields to vehicle_owners
  await knex.schema.alterTable('vehicle_owners', (table) => {
    table.string('revenue_model_type', 50).nullable();
    table.jsonb('revenue_model_config').nullable();
  });

  // 2. Settlements table
  await knex.schema.createTable('settlements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('settlement_number', 50).notNullable().unique();
    table.date('period_start').notNullable();
    table.date('period_end').notNullable();
    table.uuid('owner_id').nullable().references('id').inTable('vehicle_owners');
    table.uuid('vehicle_id').nullable().references('id').inTable('vehicles');
    table.uuid('platform_id').nullable().references('id').inTable('master_values');
    table.string('settlement_type', 50).notNullable().defaultTo('owner');
    table.decimal('total_gross_revenue', 15, 2).notNullable().defaultTo(0);
    table.decimal('total_platform_commission', 15, 2).notNullable().defaultTo(0);
    table.decimal('total_taxes', 15, 2).notNullable().defaultTo(0);
    table.decimal('total_adjustments', 15, 2).notNullable().defaultTo(0);
    table.decimal('total_approved_expenses', 15, 2).notNullable().defaultTo(0);
    table.decimal('net_revenue', 15, 2).notNullable().defaultTo(0);
    table.decimal('owner_share', 15, 2).notNullable().defaultTo(0);
    table.decimal('marc8_share', 15, 2).notNullable().defaultTo(0);
    table.string('revenue_model', 50).notNullable();
    table.decimal('owner_revenue_percentage', 5, 2).nullable();
    table.string('status', 50).notNullable().defaultTo('draft');
    table.decimal('total_paid', 15, 2).notNullable().defaultTo(0);
    table.decimal('balance_due', 15, 2).notNullable().defaultTo(0);
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.uuid('deleted_by').nullable().references('id').inTable('users');
  });

  // 3. Settlement bookings link table (snapshot at settlement time)
  await knex.schema.createTable('settlement_bookings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('settlement_id').notNullable().references('id').inTable('settlements').onDelete('CASCADE');
    table.uuid('booking_id').notNullable().references('id').inTable('bookings');
    table.decimal('gross_fare', 15, 2).notNullable().defaultTo(0);
    table.decimal('doorstep_charges', 15, 2).notNullable().defaultTo(0);
    table.decimal('platform_commission', 15, 2).notNullable().defaultTo(0);
    table.decimal('discount', 15, 2).notNullable().defaultTo(0);
    table.decimal('taxes', 15, 2).notNullable().defaultTo(0);
    table.decimal('net_revenue', 15, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['settlement_id', 'booking_id']);
  });

  // 4. Settlement expenses link table
  await knex.schema.createTable('settlement_expenses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('settlement_id').notNullable().references('id').inTable('settlements').onDelete('CASCADE');
    table.uuid('expense_id').notNullable().references('id').inTable('expenses');
    table.string('allocation_type', 50).notNullable();
    table.decimal('amount', 15, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['settlement_id', 'expense_id']);
  });

  // 5. Settlement distributions table (owner/marc8/platform split)
  await knex.schema.createTable('settlement_distributions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('settlement_id').notNullable().references('id').inTable('settlements').onDelete('CASCADE');
    table.string('recipient_type', 50).notNullable();
    table.string('recipient_name', 255).notNullable();
    table.decimal('amount', 15, 2).notNullable().defaultTo(0);
    table.decimal('percentage', 5, 2).nullable();
    table.text('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 6. Settlement approvals table
  await knex.schema.createTable('settlement_approvals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('settlement_id').notNullable().references('id').inTable('settlements').onDelete('CASCADE');
    table.uuid('approved_by').notNullable().references('id').inTable('users');
    table.timestamp('approved_at').notNullable().defaultTo(knex.fn.now());
    table.string('status', 50).notNullable();
    table.text('remarks').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 7. Settlement payments table
  await knex.schema.createTable('settlement_payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('settlement_id').notNullable().references('id').inTable('settlements').onDelete('CASCADE');
    table.string('payment_method', 50).notNullable();
    table.decimal('amount', 15, 2).notNullable().defaultTo(0);
    table.date('payment_date').notNullable();
    table.string('reference_number', 255).nullable();
    table.string('transaction_id', 255).nullable();
    table.text('remarks').nullable();
    table.string('status', 50).notNullable().defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
  });

  // 8. Settlement documents table
  await knex.schema.createTable('settlement_documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('settlement_id').notNullable().references('id').inTable('settlements').onDelete('CASCADE');
    table.string('document_name', 255).notNullable();
    table.string('file_url', 500).nullable();
    table.string('document_type', 50).nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
  });

  // 9. Seed master types
  await knex('master_types').insert([
    { code: 'settlement_status', name: 'Settlement Statuses', description: 'Workflow statuses for settlements', is_active: true },
    { code: 'settlement_revenue_model', name: 'Settlement Revenue Models', description: 'Revenue distribution models for settlements', is_active: true },
    { code: 'settlement_commission_type', name: 'Settlement Commission Types', description: 'Platform commission types for settlements', is_active: true },
    { code: 'settlement_expense_allocation', name: 'Settlement Expense Allocations', description: 'Expense allocation types for settlements', is_active: true },
    { code: 'settlement_payment_method', name: 'Settlement Payment Methods', description: 'Payment methods for settlement payouts', is_active: true },
    { code: 'settlement_tax_type', name: 'Settlement Tax Types', description: 'Tax types for settlements', is_active: true },
    { code: 'settlement_recipient_type', name: 'Settlement Recipient Types', description: 'Distribution recipient types for settlements', is_active: true },
  ]);

  const getMtId = async (code: string) => {
    const mt = await knex('master_types').where({ code }).first();
    return mt?.id;
  };

  // Settlement statuses
  const statusMtId = await getMtId('settlement_status');
  if (statusMtId) {
    const values = [
      { code: 'draft', name: 'Draft', display_order: 1, color: '#64748b', is_system: true, is_active: true },
      { code: 'calculated', name: 'Calculated', display_order: 2, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'pending_approval', name: 'Pending Approval', display_order: 3, color: '#f97316', is_system: true, is_active: true },
      { code: 'approved', name: 'Approved', display_order: 4, color: '#22c55e', is_system: true, is_active: true },
      { code: 'rejected', name: 'Rejected', display_order: 5, color: '#ef4444', is_system: true, is_active: true },
      { code: 'payment_initiated', name: 'Payment Initiated', display_order: 6, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'paid', name: 'Paid', display_order: 7, color: '#22c55e', is_system: true, is_active: true },
      { code: 'partially_paid', name: 'Partially Paid', display_order: 8, color: '#f97316', is_system: true, is_active: true },
      { code: 'cancelled', name: 'Cancelled', display_order: 9, color: '#ef4444', is_system: true, is_active: true },
      { code: 'closed', name: 'Closed', display_order: 10, color: '#64748b', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: statusMtId, ...v });
    }
  }

  // Revenue models
  const revModelMtId = await getMtId('settlement_revenue_model');
  if (revModelMtId) {
    const values = [
      { code: 'fixed_monthly', name: 'Fixed Monthly', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'revenue_share_percent', name: 'Revenue Share %', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'profit_share_percent', name: 'Profit Share %', display_order: 3, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'hybrid', name: 'Hybrid', display_order: 4, color: '#f97316', is_system: true, is_active: true },
      { code: 'minimum_guarantee', name: 'Minimum Guarantee', display_order: 5, color: '#06b6d4', is_system: true, is_active: true },
      { code: 'custom_formula', name: 'Custom Formula', display_order: 6, color: '#ec4899', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: revModelMtId, ...v });
    }
  }

  // Commission types
  const commMtId = await getMtId('settlement_commission_type');
  if (commMtId) {
    const values = [
      { code: 'commission_percent', name: 'Commission %', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'flat_fee', name: 'Flat Fee', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'booking_fee', name: 'Booking Fee', display_order: 3, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'processing_fee', name: 'Processing Fee', display_order: 4, color: '#f97316', is_system: true, is_active: true },
      { code: 'dynamic_commission', name: 'Dynamic Commission', display_order: 5, color: '#06b6d4', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: commMtId, ...v });
    }
  }

  // Expense allocations
  const allocMtId = await getMtId('settlement_expense_allocation');
  if (allocMtId) {
    const values = [
      { code: 'vehicle', name: 'Vehicle', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'booking', name: 'Booking', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'platform', name: 'Platform', display_order: 3, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'owner', name: 'Owner', display_order: 4, color: '#f97316', is_system: true, is_active: true },
      { code: 'company', name: 'Company', display_order: 5, color: '#06b6d4', is_system: true, is_active: true },
      { code: 'shared', name: 'Shared', display_order: 6, color: '#ec4899', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: allocMtId, ...v });
    }
  }

  // Payment methods
  const payMtId = await getMtId('settlement_payment_method');
  if (payMtId) {
    const values = [
      { code: 'bank_transfer', name: 'Bank Transfer', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'upi', name: 'UPI', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'cash', name: 'Cash', display_order: 3, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'cheque', name: 'Cheque', display_order: 4, color: '#f97316', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: payMtId, ...v });
    }
  }

  // Tax types
  const taxMtId = await getMtId('settlement_tax_type');
  if (taxMtId) {
    const values = [
      { code: 'gst', name: 'GST', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'tds', name: 'TDS', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'platform_deductions', name: 'Platform Deductions', display_order: 3, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'owner_deductions', name: 'Owner Deductions', display_order: 4, color: '#f97316', is_system: true, is_active: true },
      { code: 'adjustments', name: 'Adjustments', display_order: 5, color: '#06b6d4', is_system: true, is_active: true },
      { code: 'reimbursements', name: 'Reimbursements', display_order: 6, color: '#22c55e', is_system: true, is_active: true },
      { code: 'credits', name: 'Credits', display_order: 7, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'debits', name: 'Debits', display_order: 8, color: '#ef4444', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: taxMtId, ...v });
    }
  }

  // Recipient types
  const recipMtId = await getMtId('settlement_recipient_type');
  if (recipMtId) {
    const values = [
      { code: 'owner', name: 'Owner', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'marc8', name: 'Marc8', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'platform', name: 'Platform', display_order: 3, color: '#8b5cf6', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: recipMtId, ...v });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('settlement_documents');
  await knex.schema.dropTableIfExists('settlement_payments');
  await knex.schema.dropTableIfExists('settlement_approvals');
  await knex.schema.dropTableIfExists('settlement_distributions');
  await knex.schema.dropTableIfExists('settlement_expenses');
  await knex.schema.dropTableIfExists('settlement_bookings');
  await knex.schema.dropTableIfExists('settlements');

  await knex.schema.alterTable('vehicle_owners', (table) => {
    table.dropColumn('revenue_model_type');
    table.dropColumn('revenue_model_config');
  });

  const masterTypeCodes = [
    'settlement_status', 'settlement_revenue_model', 'settlement_commission_type',
    'settlement_expense_allocation', 'settlement_payment_method', 'settlement_tax_type',
    'settlement_recipient_type',
  ];
  await knex('master_values').whereIn('master_type_id', function () {
    this.select('id').from('master_types').whereIn('code', masterTypeCodes);
  }).del();
  await knex('master_types').whereIn('code', masterTypeCodes).del();
}
