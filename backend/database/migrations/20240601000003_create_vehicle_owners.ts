import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Vehicle owners table
  await knex.schema.createTable('vehicle_owners', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('owner_type', 50).notNullable().defaultTo('client_owned');
    table.string('name', 255).notNullable();
    table.string('contact_person', 255).nullable();
    table.text('address').nullable();
    table.string('city', 100).nullable();
    table.string('state', 100).nullable();
    table.string('pincode', 20).nullable();
    table.string('phone', 50).nullable();
    table.string('email', 255).nullable();
    table.string('pan', 50).nullable();
    table.string('aadhaar', 50).nullable();
    table.string('gst', 50).nullable();
    table.string('bank_account_number', 100).nullable();
    table.string('bank_name', 255).nullable();
    table.string('bank_ifsc', 50).nullable();
    table.string('upi_id', 255).nullable();
    table.string('emergency_contact_name', 255).nullable();
    table.string('emergency_contact_phone', 50).nullable();
    table.string('agreement_number', 100).nullable();
    table.date('agreement_start_date').nullable();
    table.date('agreement_end_date').nullable();
    table.string('ownership_status', 30).notNullable().defaultTo('active');
    table.string('agreement_status', 30).notNullable().defaultTo('active');
    table.text('notes').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.uuid('deleted_by').nullable().references('id').inTable('users');
  });

  // 2. Owner documents table
  await knex.schema.createTable('owner_documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('owner_id').notNullable().references('id').inTable('vehicle_owners');
    table.string('document_type', 50).notNullable();
    table.string('document_name', 255).notNullable();
    table.string('file_url', 500).nullable();
    table.date('expiry_date').nullable();
    table.string('status', 20).notNullable().defaultTo('active');
    table.integer('version').notNullable().defaultTo(1);
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
  });

  // 3. Ownership history table (immutable)
  await knex.schema.createTable('ownership_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vehicle_id').notNullable().references('id').inTable('vehicles');
    table.uuid('owner_id').nullable().references('id').inTable('vehicle_owners');
    table.string('event_type', 50).notNullable();
    table.timestamp('event_date').notNullable().defaultTo(knex.fn.now());
    table.string('previous_owner_name', 255).nullable();
    table.string('new_owner_name', 255).nullable();
    table.string('previous_agreement_number', 100).nullable();
    table.string('new_agreement_number', 100).nullable();
    table.string('previous_status', 30).nullable();
    table.string('new_status', 30).nullable();
    table.text('notes').nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
  });

  // 4. Add owner_id to vehicles (now that vehicle_owners exists)
  await knex.schema.alterTable('vehicles', (table) => {
    table.uuid('current_owner_id').nullable().references('id').inTable('vehicle_owners');
  });

  // 5. Seed master data
  await knex('master_types').insert([
    { code: 'ownership_type', name: 'Ownership Types', description: 'Types of vehicle ownership for co-hosted fleet', is_active: true },
    { code: 'owner_document_type', name: 'Owner Document Types', description: 'Types of documents for vehicle owners', is_active: true },
    { code: 'owner_agreement_status', name: 'Owner Agreement Statuses', description: 'Statuses for owner agreements', is_active: true },
    { code: 'owner_status', name: 'Owner Statuses', description: 'Statuses for vehicle owners', is_active: true },
    { code: 'ownership_event_type', name: 'Ownership Event Types', description: 'Types of ownership history events', is_active: true },
    { code: 'owner_document_status', name: 'Owner Document Statuses', description: 'Statuses for owner documents', is_active: true },
  ]);

  const getMtId = async (code: string) => {
    const mt = await knex('master_types').where({ code }).first();
    return mt?.id;
  };

  const ownTypeId = await getMtId('ownership_type');
  if (ownTypeId) {
    const values = [
      { code: 'company_owned', name: 'Company Owned', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'client_owned', name: 'Client Owned', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'partner_owned', name: 'Partner Owned', display_order: 3, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'investor_owned', name: 'Investor Owned', display_order: 4, color: '#f97316', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: ownTypeId, ...v });
    }
  }

  const docTypeId = await getMtId('owner_document_type');
  if (docTypeId) {
    const values = [
      { code: 'agreement', name: 'Agreement', display_order: 1, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'pan', name: 'PAN Card', display_order: 2, color: '#22c55e', is_system: true, is_active: true },
      { code: 'aadhaar', name: 'Aadhaar Card', display_order: 3, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'gst_certificate', name: 'GST Certificate', display_order: 4, color: '#f97316', is_system: true, is_active: true },
      { code: 'cancelled_cheque', name: 'Cancelled Cheque', display_order: 5, color: '#06b6d4', is_system: true, is_active: true },
      { code: 'rc_copy', name: 'RC Copy', display_order: 6, color: '#ec4899', is_system: true, is_active: true },
      { code: 'insurance_copy', name: 'Insurance Copy', display_order: 7, color: '#14b8a6', is_system: true, is_active: true },
      { code: 'other', name: 'Other Document', display_order: 99, color: '#64748b', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: docTypeId, ...v });
    }
  }

  const agreeStatusId = await getMtId('owner_agreement_status');
  if (agreeStatusId) {
    const values = [
      { code: 'active', name: 'Active', display_order: 1, color: '#22c55e', is_system: true, is_active: true },
      { code: 'expired', name: 'Expired', display_order: 2, color: '#ef4444', is_system: true, is_active: true },
      { code: 'terminated', name: 'Terminated', display_order: 3, color: '#f97316', is_system: true, is_active: true },
      { code: 'renewed', name: 'Renewed', display_order: 4, color: '#3b82f6', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: agreeStatusId, ...v });
    }
  }

  const ownerStatusId = await getMtId('owner_status');
  if (ownerStatusId) {
    const values = [
      { code: 'active', name: 'Active', display_order: 1, color: '#22c55e', is_system: true, is_active: true },
      { code: 'suspended', name: 'Suspended', display_order: 2, color: '#f97316', is_system: true, is_active: true },
      { code: 'inactive', name: 'Inactive', display_order: 3, color: '#64748b', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: ownerStatusId, ...v });
    }
  }

  const eventTypeId = await getMtId('ownership_event_type');
  if (eventTypeId) {
    const values = [
      { code: 'owner_assigned', name: 'Owner Assigned', display_order: 1, color: '#22c55e', is_system: true, is_active: true },
      { code: 'owner_changed', name: 'Owner Changed', display_order: 2, color: '#3b82f6', is_system: true, is_active: true },
      { code: 'agreement_renewed', name: 'Agreement Renewed', display_order: 3, color: '#8b5cf6', is_system: true, is_active: true },
      { code: 'ownership_transferred', name: 'Ownership Transferred', display_order: 4, color: '#f97316', is_system: true, is_active: true },
      { code: 'ownership_suspended', name: 'Ownership Suspended', display_order: 5, color: '#ef4444', is_system: true, is_active: true },
      { code: 'ownership_reactivated', name: 'Ownership Reactivated', display_order: 6, color: '#22c55e', is_system: true, is_active: true },
      { code: 'ownership_ended', name: 'Ownership Ended', display_order: 7, color: '#64748b', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: eventTypeId, ...v });
    }
  }

  const docStatusId = await getMtId('owner_document_status');
  if (docStatusId) {
    const values = [
      { code: 'active', name: 'Active', display_order: 1, color: '#22c55e', is_system: true, is_active: true },
      { code: 'expired', name: 'Expired', display_order: 2, color: '#ef4444', is_system: true, is_active: true },
      { code: 'expiring_soon', name: 'Expiring Soon', display_order: 3, color: '#f97316', is_system: true, is_active: true },
    ];
    for (const v of values) {
      await knex('master_values').insert({ master_type_id: docStatusId, ...v });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ownership_history');
  await knex.schema.dropTableIfExists('owner_documents');
  await knex.schema.dropTableIfExists('vehicle_owners');

  await knex.schema.alterTable('vehicles', (table) => {
    table.dropColumn('current_owner_id');
  });

  const masterTypeCodes = ['ownership_type', 'owner_document_type', 'owner_agreement_status', 'owner_status', 'ownership_event_type', 'owner_document_status'];
  await knex('master_values').whereIn('master_type_id', function () {
    this.select('id').from('master_types').whereIn('code', masterTypeCodes);
  }).del();
  await knex('master_types').whereIn('code', masterTypeCodes).del();
}
