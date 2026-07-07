import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // ─── PART 3: FLEET MODEL — Add CO_HOSTED_CLIENT to existing ownership_type master data ───
  const ownTypeMt = await knex('master_types').where({ code: 'ownership_type' }).first();
  if (ownTypeMt) {
    const existing = await knex('master_values')
      .where({ master_type_id: ownTypeMt.id, code: 'CO_HOSTED_CLIENT' })
      .first();
    if (!existing) {
      await knex('master_values').insert({
        master_type_id: ownTypeMt.id,
        code: 'CO_HOSTED_CLIENT',
        name: 'Co-Hosted Client',
        description: 'Client-owned vehicle on revenue-sharing model',
        display_order: 5,
        color: '#ff7200',
        is_system: true,
        is_active: true,
      });
    }
  }

  // ─── PART 6: RBAC — Add restrictions field for granular permission overrides ───
  await knex.schema.alterTable('users', (table) => {
    table.jsonb('restrictions').nullable().defaultTo(null);
  });

  // ─── PART 5: MASTER DATA — Seed missing master types and values ───

  // 5a. Expense Category
  const existingExpCat = await knex('master_types').where({ code: 'expense_category' }).first();
  let expenseCategoryId = existingExpCat?.id;
  if (!expenseCategoryId) {
    await knex('master_types').insert({
      code: 'expense_category',
      name: 'Expense Categories',
      description: 'Categories for operational expenses',
      is_active: true,
    });
    const mt = await knex('master_types').where({ code: 'expense_category' }).first();
    expenseCategoryId = mt?.id;
  }
  if (expenseCategoryId) {
    const expenseCategories = [
      { code: 'routine_maintenance', name: 'Routine Maintenance', display_order: 1, color: '#3b82f6' },
      { code: 'insurance_premiums', name: 'Insurance Premiums', display_order: 2, color: '#22c55e' },
      { code: 'state_permits', name: 'State Permits', display_order: 3, color: '#8b5cf6' },
      { code: 'road_tax', name: 'Road Tax', display_order: 4, color: '#f97316' },
      { code: 'driver_salaries', name: 'Driver Salaries', display_order: 5, color: '#06b6d4' },
      { code: 'general_administration', name: 'General Administration Overheads', display_order: 6, color: '#64748b' },
    ];
    for (const cat of expenseCategories) {
      const existing = await knex('master_values')
        .where({ master_type_id: expenseCategoryId, code: cat.code })
        .first();
      if (!existing) {
        await knex('master_values').insert({
          master_type_id: expenseCategoryId,
          ...cat,
          is_system: true,
          is_active: true,
        });
      }
    }
  }

  // 5b. Payment Mode
  const existingPayMode = await knex('master_types').where({ code: 'payment_mode' }).first();
  let paymentModeId = existingPayMode?.id;
  if (!paymentModeId) {
    await knex('master_types').insert({
      code: 'payment_mode',
      name: 'Payment Modes',
      description: 'Methods of payment for expenses and settlements',
      is_active: true,
    });
    const mt = await knex('master_types').where({ code: 'payment_mode' }).first();
    paymentModeId = mt?.id;
  }
  if (paymentModeId) {
    const paymentModes = [
      { code: 'cash', name: 'Cash', display_order: 1, color: '#22c55e' },
      { code: 'upi', name: 'UPI', display_order: 2, color: '#3b82f6' },
      { code: 'corporate_card', name: 'Corporate Card', display_order: 3, color: '#8b5cf6' },
      { code: 'fleet_fuel_card', name: 'Fleet Fuel Card', display_order: 4, color: '#f97316' },
    ];
    for (const pm of paymentModes) {
      const existing = await knex('master_values')
        .where({ master_type_id: paymentModeId, code: pm.code })
        .first();
      if (!existing) {
        await knex('master_values').insert({
          master_type_id: paymentModeId,
          ...pm,
          is_system: true,
          is_active: true,
        });
      }
    }
  }

  // 5c. Journal Category
  const existingJrnlCat = await knex('master_types').where({ code: 'journal_category' }).first();
  let journalCategoryId = existingJrnlCat?.id;
  if (!journalCategoryId) {
    await knex('master_types').insert({
      code: 'journal_category',
      name: 'Journal Categories',
      description: 'Ledger allocation categories for journal entries',
      is_active: true,
    });
    const mt = await knex('master_types').where({ code: 'journal_category' }).first();
    journalCategoryId = mt?.id;
  }
  if (journalCategoryId) {
    const journalCategories = [
      { code: 'fastag', name: 'Fastag', display_order: 1, color: '#3b82f6' },
      { code: 'fuel', name: 'Fuel', display_order: 2, color: '#22c55e' },
      { code: 'instances', name: 'Instances', display_order: 3, color: '#f97316' },
      { code: 'washing', name: 'Washing', display_order: 4, color: '#8b5cf6' },
      { code: 'damage', name: 'Damage', display_order: 5, color: '#ef4444' },
    ];
    for (const jc of journalCategories) {
      const existing = await knex('master_values')
        .where({ master_type_id: journalCategoryId, code: jc.code })
        .first();
      if (!existing) {
        await knex('master_values').insert({
          master_type_id: journalCategoryId,
          ...jc,
          is_system: true,
          is_active: true,
        });
      }
    }
  }

  // 5d. Platform — ensure all BRD platforms exist
  const platformMt = await knex('master_types').where({ code: 'platform' }).first();
  let platformId = platformMt?.id;
  if (!platformId) {
    await knex('master_types').insert({
      code: 'platform',
      name: 'Platforms',
      description: 'Booking platforms where vehicles are listed',
      is_active: true,
    });
    const mt = await knex('master_types').where({ code: 'platform' }).first();
    platformId = mt?.id;
  }
  if (platformId) {
    const platforms = [
      { code: 'zoomcar', name: 'Zoomcar', display_order: 1, color: '#3b82f6' },
      { code: 'revv', name: 'Revv', display_order: 2, color: '#22c55e' },
      { code: 'bharat', name: 'Bharat', display_order: 3, color: '#f97316' },
      { code: 'marc8', name: 'Marc8', display_order: 4, color: '#8b5cf6' },
      { code: 'offline', name: 'Offline', display_order: 10, color: '#64748b' },
    ];
    for (const p of platforms) {
      const existing = await knex('master_values')
        .where({ master_type_id: platformId, code: p.code })
        .first();
      if (!existing) {
        await knex('master_values').insert({
          master_type_id: platformId,
          ...p,
          is_system: true,
          is_active: true,
        });
      }
    }
  }

  // ─── PART 4: BOOKING MODEL — Add BRD-mandated fields ───
  await knex.schema.alterTable('bookings', (table) => {
    table.string('customer_phone', 20).nullable();
    table.integer('start_km').nullable();
    table.integer('end_km').nullable();
    table.jsonb('pre_check_images').nullable();
    table.jsonb('post_check_images').nullable();
    table.decimal('fastag_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('fuel_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('incidents_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('washing_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('cancellation_fee', 12, 2).notNullable().defaultTo(0);
    table.decimal('late_return_fee', 12, 2).notNullable().defaultTo(0);
    table.decimal('co_driver_fee', 12, 2).notNullable().defaultTo(0);
    table.decimal('damage_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('doorstep_delivery_fee', 12, 2).notNullable().defaultTo(0);
    table.decimal('miscellaneous_amount', 12, 2).notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Revert booking fields
  await knex.schema.alterTable('bookings', (table) => {
    table.dropColumn('customer_phone');
    table.dropColumn('start_km');
    table.dropColumn('end_km');
    table.dropColumn('pre_check_images');
    table.dropColumn('post_check_images');
    table.dropColumn('fastag_amount');
    table.dropColumn('fuel_amount');
    table.dropColumn('incidents_amount');
    table.dropColumn('washing_amount');
    table.dropColumn('cancellation_fee');
    table.dropColumn('late_return_fee');
    table.dropColumn('co_driver_fee');
    table.dropColumn('damage_amount');
    table.dropColumn('doorstep_delivery_fee');
    table.dropColumn('miscellaneous_amount');
  });

  // Remove CO_HOSTED_CLIENT ownership type
  const ownTypeMt = await knex('master_types').where({ code: 'ownership_type' }).first();
  if (ownTypeMt) {
    await knex('master_values')
      .where({ master_type_id: ownTypeMt.id, code: 'CO_HOSTED_CLIENT' })
      .del();
  }

  // Remove seeded master data (only if we created it)
  const cleanMaster = async (code: string, valueCodes: string[]) => {
    const mt = await knex('master_types').where({ code }).first();
    if (mt) {
      // Only delete if we added these values (they might have been already present)
      for (const vc of valueCodes) {
        await knex('master_values')
          .where({ master_type_id: mt.id, code: vc })
          .del();
      }
    }
  };

  await cleanMaster('expense_category', [
    'routine_maintenance', 'insurance_premiums', 'state_permits',
    'road_tax', 'driver_salaries', 'general_administration',
  ]);
  await cleanMaster('payment_mode', ['cash', 'upi', 'corporate_card', 'fleet_fuel_card']);
  await cleanMaster('journal_category', ['fastag', 'fuel', 'instances', 'washing', 'damage']);
  await cleanMaster('platform', ['zoomcar', 'revv', 'bharat', 'marc8', 'offline']);
}
