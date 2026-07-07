import type { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  // ────────────────────────────────────────────────────────────────
  // CANONICAL MASTER DATA SEED — Single Source of Truth
  // All master types and values must be defined here.
  // Uses upsert (insert on conflict) — never delete+reinsert.
  // This file is the authoritative source; migrations that seed
  // master data must use identical values.
  // ────────────────────────────────────────────────────────────────

  const now = knex.fn.now();

  // ────────────────────────────────────────────────────────────────
  // Master Types
  // ────────────────────────────────────────────────────────────────
  const allTypes: { code: string; name: string; description: string | null }[] = [
    // Core system types (seeded first — no FK dependencies)
    { code: 'platform', name: 'Platforms', description: 'Booking platforms where vehicles are listed' },
    { code: 'expense_category', name: 'Expense Categories', description: 'Categories for classifying operational expenses' },
    { code: 'journal_category', name: 'Journal Categories', description: 'Ledger allocation categories for journal entries' },
    { code: 'payment_mode', name: 'Payment Modes', description: 'Methods of payment for expenses and settlements' },
    { code: 'fuel_type', name: 'Fuel Types', description: 'Types of fuel used by vehicles' },
    { code: 'vehicle_status', name: 'Vehicle Status', description: 'Operational statuses for vehicles' },
    { code: 'ownership_type', name: 'Ownership Types', description: 'Types of vehicle ownership for fleet and co-hosted models' },
    { code: 'transmission_type', name: 'Transmission Types', description: 'Types of vehicle transmission' },
    // Outstanding module
    { code: 'outstanding_category', name: 'Outstanding Categories', description: 'Categories for outstanding liabilities' },
    { code: 'outstanding_priority', name: 'Outstanding Priorities', description: 'Priority levels for outstanding items' },
    { code: 'platform_category', name: 'Platform Categories', description: 'Categories for booking platforms' },
    // Fleet operations module
    { code: 'maintenance_type', name: 'Maintenance Types', description: 'Types of vehicle maintenance' },
    { code: 'part_category', name: 'Part Categories', description: 'Categories for replacement parts' },
    { code: 'vendor_type', name: 'Vendor Types', description: 'Types of vendors/suppliers' },
    { code: 'service_type', name: 'Service Types', description: 'Types of service scheduling' },
    { code: 'timeline_event_type', name: 'Timeline Event Types', description: 'Types of vehicle timeline events' },
    // Vehicle owners module
    { code: 'owner_document_type', name: 'Owner Document Types', description: 'Types of documents for vehicle owners' },
    { code: 'owner_agreement_status', name: 'Owner Agreement Statuses', description: 'Statuses for owner agreements' },
    { code: 'owner_status', name: 'Owner Statuses', description: 'Statuses for vehicle owners' },
    { code: 'ownership_event_type', name: 'Ownership Event Types', description: 'Types of ownership history events' },
    { code: 'owner_document_status', name: 'Owner Document Statuses', description: 'Statuses for owner documents' },
    // Settlement module
    { code: 'settlement_status', name: 'Settlement Statuses', description: 'Workflow statuses for settlements' },
    { code: 'settlement_revenue_model', name: 'Settlement Revenue Models', description: 'Revenue distribution models for settlements' },
    { code: 'settlement_commission_type', name: 'Settlement Commission Types', description: 'Platform commission types for settlements' },
    { code: 'settlement_expense_allocation', name: 'Settlement Expense Allocations', description: 'Expense allocation types for settlements' },
    { code: 'settlement_payment_method', name: 'Settlement Payment Methods', description: 'Payment methods for settlement payouts' },
    { code: 'settlement_tax_type', name: 'Settlement Tax Types', description: 'Tax types for settlements' },
    { code: 'settlement_recipient_type', name: 'Settlement Recipient Types', description: 'Distribution recipient types for settlements' },
  ];

  const typeIdMap: Record<string, string> = {};

  for (const t of allTypes) {
    const existing = await knex('master_types').where({ code: t.code }).first();
    if (existing) {
      typeIdMap[t.code] = existing.id;
      await knex('master_types').where({ code: t.code }).update({
        name: t.name,
        description: t.description,
        updated_at: now,
      });
    } else {
      const id = uuidv4();
      typeIdMap[t.code] = id;
      await knex('master_types').insert({
        id,
        code: t.code,
        name: t.name,
        description: t.description,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    }
  }

  // ────────────────────────────────────────────────────────────────
  // Helper: upsert a master value
  // ────────────────────────────────────────────────────────────────
  async function upsertValue(
    typeCode: string,
    value: {
      code: string;
      name: string;
      display_order: number;
      color: string | null;
      is_system: boolean;
      description?: string | null;
    },
  ): Promise<void> {
    const typeId = typeIdMap[typeCode];
    if (!typeId) {
      console.warn(`Master type '${typeCode}' not found — skipping value '${value.code}'`);
      return;
    }
    const existing = await knex('master_values')
      .where({ master_type_id: typeId, code: value.code })
      .first();
    if (existing) {
      await knex('master_values')
        .where({ master_type_id: typeId, code: value.code })
        .update({
          name: value.name,
          display_order: value.display_order,
          color: value.color,
          is_system: value.is_system,
          is_active: true,
          updated_at: now,
        });
    } else {
      await knex('master_values').insert({
        id: uuidv4(),
        master_type_id: typeId,
        code: value.code,
        name: value.name,
        description: value.description ?? null,
        display_order: value.display_order,
        color: value.color ?? null,
        icon: null,
        is_system: value.is_system,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    }
  }

  // ────────────────────────────────────────────────────────────────
  // PLATFORM — Per BRD: Zoomcar, Revv, Bharat Cars, Marc8, Offline
  // ────────────────────────────────────────────────────────────────
  const platformValues = [
    { code: 'zoomcar', name: 'Zoomcar', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'revv', name: 'Revv', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'bharat', name: 'Bharat', display_order: 3, color: '#f97316', is_system: true },
    { code: 'marc8', name: 'Marc8', display_order: 4, color: '#8b5cf6', is_system: true },
    { code: 'offline', name: 'Offline', display_order: 10, color: '#64748b', is_system: true },
  ];
  for (const v of platformValues) {
    await upsertValue('platform', v);
  }

  // ────────────────────────────────────────────────────────────────
  // EXPENSE CATEGORY — Per PRD
  // ────────────────────────────────────────────────────────────────
  const expenseCatValues = [
    { code: 'routine_maintenance', name: 'Routine Maintenance', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'insurance_premiums', name: 'Insurance Premiums', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'state_permits', name: 'State Permits', display_order: 3, color: '#8b5cf6', is_system: true },
    { code: 'road_tax', name: 'Road Tax', display_order: 4, color: '#f97316', is_system: true },
    { code: 'driver_salaries', name: 'Driver Salaries', display_order: 5, color: '#06b6d4', is_system: true },
    { code: 'general_administration', name: 'General Administration Overheads', display_order: 6, color: '#64748b', is_system: true },
    { code: 'fuel', name: 'Fuel', display_order: 7, color: '#eab308', is_system: true },
    { code: 'toll_parking', name: 'Toll & Parking', display_order: 8, color: '#14b8a6', is_system: true },
    { code: 'cleaning', name: 'Cleaning & Washing', display_order: 9, color: '#36d399', is_system: true },
  ];
  for (const v of expenseCatValues) {
    await upsertValue('expense_category', v);
  }

  // ────────────────────────────────────────────────────────────────
  // PAYMENT MODE — Merged from seed + migration 05
  // ────────────────────────────────────────────────────────────────
  const paymentModeValues = [
    { code: 'cash', name: 'Cash', display_order: 1, color: '#22c55e', is_system: true },
    { code: 'upi', name: 'UPI', display_order: 2, color: '#3b82f6', is_system: true },
    { code: 'corporate_card', name: 'Corporate Card', display_order: 3, color: '#8b5cf6', is_system: true },
    { code: 'fleet_fuel_card', name: 'Fleet Fuel Card', display_order: 4, color: '#f97316', is_system: true },
    { code: 'bank_transfer', name: 'Bank Transfer', display_order: 5, color: '#06b6d4', is_system: true },
    { code: 'credit_card', name: 'Credit Card', display_order: 6, color: '#ec4899', is_system: true },
    { code: 'debit_card', name: 'Debit Card', display_order: 7, color: '#36d399', is_system: true },
    { code: 'cheque', name: 'Cheque', display_order: 8, color: '#a855f7', is_system: true },
    { code: 'online', name: 'Online', display_order: 9, color: '#64748b', is_system: true },
  ];
  for (const v of paymentModeValues) {
    await upsertValue('payment_mode', v);
  }

  // ────────────────────────────────────────────────────────────────
  // JOURNAL CATEGORY — Per PRD: Fastag, Fuel, Instances, Washing, Damage
  // ────────────────────────────────────────────────────────────────
  const journalCatValues = [
    { code: 'fastag', name: 'Fastag', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'fuel', name: 'Fuel', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'instances', name: 'Instances', display_order: 3, color: '#f97316', is_system: true },
    { code: 'washing', name: 'Washing', display_order: 4, color: '#8b5cf6', is_system: true },
    { code: 'damage', name: 'Damage', display_order: 5, color: '#ef4444', is_system: true },
  ];
  for (const v of journalCatValues) {
    await upsertValue('journal_category', v);
  }

  // ────────────────────────────────────────────────────────────────
  // FUEL TYPE
  // ────────────────────────────────────────────────────────────────
  const fuelTypeValues = [
    { code: 'diesel', name: 'Diesel', display_order: 1, color: null, is_system: true },
    { code: 'petrol', name: 'Petrol', display_order: 2, color: null, is_system: true },
    { code: 'cng', name: 'CNG', display_order: 3, color: null, is_system: true },
    { code: 'electric', name: 'Electric', display_order: 4, color: null, is_system: true },
  ];
  for (const v of fuelTypeValues) {
    await upsertValue('fuel_type', v);
  }

  // ────────────────────────────────────────────────────────────────
  // VEHICLE STATUS
  // ────────────────────────────────────────────────────────────────
  const vehicleStatusValues = [
    { code: 'available', name: 'Available', display_order: 1, color: '#10B981', is_system: true },
    { code: 'booked', name: 'Booked', display_order: 2, color: '#3B82F6', is_system: true },
    { code: 'maintenance', name: 'Maintenance', display_order: 3, color: '#F59E0B', is_system: true },
    { code: 'inactive', name: 'Inactive', display_order: 4, color: '#6B7280', is_system: true },
  ];
  for (const v of vehicleStatusValues) {
    await upsertValue('vehicle_status', v);
  }

  // ────────────────────────────────────────────────────────────────
  // OWNERSHIP TYPE — Per BRD: OWNED and CO-HOSTED_CLIENT mandatory
  // ────────────────────────────────────────────────────────────────
  const ownershipTypeValues = [
    { code: 'owned', name: 'Owned', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'CO_HOSTED_CLIENT', name: 'Co-Hosted Client', display_order: 2, color: '#ff7200', is_system: true, description: 'Client-owned vehicle on revenue-sharing model' },
    { code: 'leased', name: 'Leased', display_order: 3, color: '#22c55e', is_system: true },
    { code: 'rental', name: 'Rental', display_order: 4, color: '#8b5cf6', is_system: true },
    { code: 'company_owned', name: 'Company Owned', display_order: 5, color: '#06b6d4', is_system: true },
    { code: 'partner_owned', name: 'Partner Owned', display_order: 6, color: '#f97316', is_system: true },
    { code: 'investor_owned', name: 'Investor Owned', display_order: 7, color: '#ec4899', is_system: true },
  ];
  for (const v of ownershipTypeValues) {
    await upsertValue('ownership_type', v);
  }

  // ────────────────────────────────────────────────────────────────
  // TRANSMISSION TYPE
  // ────────────────────────────────────────────────────────────────
  const transTypeValues = [
    { code: 'manual', name: 'Manual', display_order: 1, color: null, is_system: true },
    { code: 'automatic', name: 'Automatic', display_order: 2, color: null, is_system: true },
  ];
  for (const v of transTypeValues) {
    await upsertValue('transmission_type', v);
  }

  // ────────────────────────────────────────────────────────────────
  // OUTSTANDING CATEGORY
  // ────────────────────────────────────────────────────────────────
  const outstandingCatValues = [
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
    { code: 'other_outstanding', name: 'Other', display_order: 99, color: '#64748b', is_system: true },
  ];
  for (const v of outstandingCatValues) {
    await upsertValue('outstanding_category', v);
  }

  // ────────────────────────────────────────────────────────────────
  // OUTSTANDING PRIORITY
  // ────────────────────────────────────────────────────────────────
  const priorityValues = [
    { code: 'low', name: 'Low', display_order: 1, color: '#22c55e', is_system: true },
    { code: 'normal', name: 'Normal', display_order: 2, color: '#3b82f6', is_system: true },
    { code: 'high', name: 'High', display_order: 3, color: '#f97316', is_system: true },
    { code: 'urgent', name: 'Urgent', display_order: 4, color: '#ef4444', is_system: true },
  ];
  for (const v of priorityValues) {
    await upsertValue('outstanding_priority', v);
  }

  // ────────────────────────────────────────────────────────────────
  // PLATFORM CATEGORY
  // ────────────────────────────────────────────────────────────────
  const platformCatValues = [
    { code: 'aggregator', name: 'Aggregator', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'direct', name: 'Direct', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'fleet', name: 'Fleet', display_order: 3, color: '#8b5cf6', is_system: true },
    { code: 'corporate', name: 'Corporate', display_order: 4, color: '#f97316', is_system: true },
  ];
  for (const v of platformCatValues) {
    await upsertValue('platform_category', v);
  }

  // ────────────────────────────────────────────────────────────────
  // MAINTENANCE TYPE
  // ────────────────────────────────────────────────────────────────
  const maintTypeValues = [
    { code: 'general_service', name: 'General Service', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'preventive', name: 'Preventive Service', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'breakdown', name: 'Breakdown Repair', display_order: 3, color: '#ef4444', is_system: true },
    { code: 'accident', name: 'Accident Repair', display_order: 4, color: '#f97316', is_system: true },
    { code: 'emergency', name: 'Emergency Repair', display_order: 5, color: '#dc2626', is_system: true },
    { code: 'tyre_change', name: 'Tyre Change', display_order: 6, color: '#8b5cf6', is_system: true },
    { code: 'battery', name: 'Battery', display_order: 7, color: '#06b6d4', is_system: true },
    { code: 'oil_change', name: 'Oil Change', display_order: 8, color: '#eab308', is_system: true },
    { code: 'brake', name: 'Brake', display_order: 9, color: '#ec4899', is_system: true },
    { code: 'suspension', name: 'Suspension', display_order: 10, color: '#14b8a6', is_system: true },
    { code: 'electrical', name: 'Electrical', display_order: 11, color: '#6366f1', is_system: true },
    { code: 'body_work', name: 'Body Work', display_order: 12, color: '#f43f5e', is_system: true },
    { code: 'painting', name: 'Painting', display_order: 13, color: '#a855f7', is_system: true },
    { code: 'accessories', name: 'Accessories', display_order: 14, color: '#64748b', is_system: true },
    { code: 'other_maintenance', name: 'Other', display_order: 99, color: '#94a3b8', is_system: true },
  ];
  for (const v of maintTypeValues) {
    await upsertValue('maintenance_type', v);
  }

  // ────────────────────────────────────────────────────────────────
  // PART CATEGORY
  // ────────────────────────────────────────────────────────────────
  const partCatValues = [
    { code: 'engine_oil', name: 'Engine Oil', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'gear_oil', name: 'Gear Oil', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'brake_oil', name: 'Brake Oil', display_order: 3, color: '#ef4444', is_system: true },
    { code: 'coolant', name: 'Coolant', display_order: 4, color: '#06b6d4', is_system: true },
    { code: 'tyres', name: 'Tyres', display_order: 5, color: '#8b5cf6', is_system: true },
    { code: 'battery_part', name: 'Battery', display_order: 6, color: '#f97316', is_system: true },
    { code: 'brake_pads', name: 'Brake Pads', display_order: 7, color: '#ec4899', is_system: true },
    { code: 'air_filter', name: 'Air Filter', display_order: 8, color: '#14b8a6', is_system: true },
    { code: 'fuel_filter', name: 'Fuel Filter', display_order: 9, color: '#eab308', is_system: true },
    { code: 'ac_filter', name: 'AC Filter', display_order: 10, color: '#6366f1', is_system: true },
    { code: 'clutch', name: 'Clutch', display_order: 11, color: '#f43f5e', is_system: true },
    { code: 'suspension_parts', name: 'Suspension', display_order: 12, color: '#a855f7', is_system: true },
    { code: 'spark_plug', name: 'Spark Plug', display_order: 13, color: '#64748b', is_system: true },
    { code: 'bulbs', name: 'Bulbs', display_order: 14, color: '#fbbf24', is_system: true },
    { code: 'other_parts', name: 'Other Parts', display_order: 99, color: '#94a3b8', is_system: true },
  ];
  for (const v of partCatValues) {
    await upsertValue('part_category', v);
  }

  // ────────────────────────────────────────────────────────────────
  // VENDOR TYPE
  // ────────────────────────────────────────────────────────────────
  const vendorTypeValues = [
    { code: 'garage', name: 'Garage', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'mechanic', name: 'Mechanic', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'parts_supplier', name: 'Parts Supplier', display_order: 3, color: '#f97316', is_system: true },
    { code: 'insurance_partner', name: 'Insurance Partner', display_order: 4, color: '#8b5cf6', is_system: true },
    { code: 'finance_company', name: 'Finance Company', display_order: 5, color: '#06b6d4', is_system: true },
    { code: 'other_vendor', name: 'Other', display_order: 99, color: '#94a3b8', is_system: true },
  ];
  for (const v of vendorTypeValues) {
    await upsertValue('vendor_type', v);
  }

  // ────────────────────────────────────────────────────────────────
  // OWNER DOCUMENT TYPE
  // ────────────────────────────────────────────────────────────────
  const ownerDocValues = [
    { code: 'agreement', name: 'Agreement', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'pan', name: 'PAN Card', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'aadhaar', name: 'Aadhaar Card', display_order: 3, color: '#8b5cf6', is_system: true },
    { code: 'gst_certificate', name: 'GST Certificate', display_order: 4, color: '#f97316', is_system: true },
    { code: 'cancelled_cheque', name: 'Cancelled Cheque', display_order: 5, color: '#06b6d4', is_system: true },
    { code: 'rc_copy', name: 'RC Copy', display_order: 6, color: '#ec4899', is_system: true },
    { code: 'insurance_copy', name: 'Insurance Copy', display_order: 7, color: '#14b8a6', is_system: true },
    { code: 'other_document', name: 'Other Document', display_order: 99, color: '#64748b', is_system: true },
  ];
  for (const v of ownerDocValues) {
    await upsertValue('owner_document_type', v);
  }

  // ────────────────────────────────────────────────────────────────
  // OWNER AGREEMENT STATUS
  // ────────────────────────────────────────────────────────────────
  const agreeStatusValues = [
    { code: 'active', name: 'Active', display_order: 1, color: '#22c55e', is_system: true },
    { code: 'expired', name: 'Expired', display_order: 2, color: '#ef4444', is_system: true },
    { code: 'terminated', name: 'Terminated', display_order: 3, color: '#f97316', is_system: true },
    { code: 'renewed', name: 'Renewed', display_order: 4, color: '#3b82f6', is_system: true },
  ];
  for (const v of agreeStatusValues) {
    await upsertValue('owner_agreement_status', v);
  }

  // ────────────────────────────────────────────────────────────────
  // OWNER STATUS
  // ────────────────────────────────────────────────────────────────
  const ownerStatusValues = [
    { code: 'active', name: 'Active', display_order: 1, color: '#22c55e', is_system: true },
    { code: 'suspended', name: 'Suspended', display_order: 2, color: '#f97316', is_system: true },
    { code: 'inactive', name: 'Inactive', display_order: 3, color: '#64748b', is_system: true },
  ];
  for (const v of ownerStatusValues) {
    await upsertValue('owner_status', v);
  }

  // ────────────────────────────────────────────────────────────────
  // OWNERSHIP EVENT TYPE
  // ────────────────────────────────────────────────────────────────
  const ownershipEventValues = [
    { code: 'owner_assigned', name: 'Owner Assigned', display_order: 1, color: '#22c55e', is_system: true },
    { code: 'owner_changed', name: 'Owner Changed', display_order: 2, color: '#3b82f6', is_system: true },
    { code: 'agreement_renewed', name: 'Agreement Renewed', display_order: 3, color: '#8b5cf6', is_system: true },
    { code: 'ownership_transferred', name: 'Ownership Transferred', display_order: 4, color: '#f97316', is_system: true },
    { code: 'ownership_suspended', name: 'Ownership Suspended', display_order: 5, color: '#ef4444', is_system: true },
    { code: 'ownership_reactivated', name: 'Ownership Reactivated', display_order: 6, color: '#22c55e', is_system: true },
    { code: 'ownership_ended', name: 'Ownership Ended', display_order: 7, color: '#64748b', is_system: true },
  ];
  for (const v of ownershipEventValues) {
    await upsertValue('ownership_event_type', v);
  }

  // ────────────────────────────────────────────────────────────────
  // OWNER DOCUMENT STATUS
  // ────────────────────────────────────────────────────────────────
  const docStatusValues = [
    { code: 'active', name: 'Active', display_order: 1, color: '#22c55e', is_system: true },
    { code: 'expired', name: 'Expired', display_order: 2, color: '#ef4444', is_system: true },
    { code: 'expiring_soon', name: 'Expiring Soon', display_order: 3, color: '#f97316', is_system: true },
  ];
  for (const v of docStatusValues) {
    await upsertValue('owner_document_status', v);
  }

  // ────────────────────────────────────────────────────────────────
  // SETTLEMENT STATUS
  // ────────────────────────────────────────────────────────────────
  const settlementStatusValues = [
    { code: 'draft', name: 'Draft', display_order: 1, color: '#64748b', is_system: true },
    { code: 'calculated', name: 'Calculated', display_order: 2, color: '#3b82f6', is_system: true },
    { code: 'pending_approval', name: 'Pending Approval', display_order: 3, color: '#f97316', is_system: true },
    { code: 'approved', name: 'Approved', display_order: 4, color: '#22c55e', is_system: true },
    { code: 'rejected', name: 'Rejected', display_order: 5, color: '#ef4444', is_system: true },
    { code: 'payment_initiated', name: 'Payment Initiated', display_order: 6, color: '#8b5cf6', is_system: true },
    { code: 'paid', name: 'Paid', display_order: 7, color: '#22c55e', is_system: true },
    { code: 'partially_paid', name: 'Partially Paid', display_order: 8, color: '#f97316', is_system: true },
    { code: 'cancelled', name: 'Cancelled', display_order: 9, color: '#ef4444', is_system: true },
    { code: 'closed', name: 'Closed', display_order: 10, color: '#64748b', is_system: true },
  ];
  for (const v of settlementStatusValues) {
    await upsertValue('settlement_status', v);
  }

  // ────────────────────────────────────────────────────────────────
  // SETTLEMENT REVENUE MODEL
  // ────────────────────────────────────────────────────────────────
  const revModelValues = [
    { code: 'fixed_monthly', name: 'Fixed Monthly', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'revenue_share_percent', name: 'Revenue Share %', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'profit_share_percent', name: 'Profit Share %', display_order: 3, color: '#8b5cf6', is_system: true },
    { code: 'hybrid', name: 'Hybrid', display_order: 4, color: '#f97316', is_system: true },
    { code: 'minimum_guarantee', name: 'Minimum Guarantee', display_order: 5, color: '#06b6d4', is_system: true },
    { code: 'custom_formula', name: 'Custom Formula', display_order: 6, color: '#ec4899', is_system: true },
  ];
  for (const v of revModelValues) {
    await upsertValue('settlement_revenue_model', v);
  }

  // ────────────────────────────────────────────────────────────────
  // SETTLEMENT COMMISSION TYPE
  // ────────────────────────────────────────────────────────────────
  const commTypeValues = [
    { code: 'commission_percent', name: 'Commission %', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'flat_fee', name: 'Flat Fee', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'booking_fee', name: 'Booking Fee', display_order: 3, color: '#8b5cf6', is_system: true },
    { code: 'processing_fee', name: 'Processing Fee', display_order: 4, color: '#f97316', is_system: true },
    { code: 'dynamic_commission', name: 'Dynamic Commission', display_order: 5, color: '#06b6d4', is_system: true },
  ];
  for (const v of commTypeValues) {
    await upsertValue('settlement_commission_type', v);
  }

  // ────────────────────────────────────────────────────────────────
  // SETTLEMENT EXPENSE ALLOCATION
  // ────────────────────────────────────────────────────────────────
  const expenseAllocValues = [
    { code: 'vehicle', name: 'Vehicle', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'booking', name: 'Booking', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'platform', name: 'Platform', display_order: 3, color: '#8b5cf6', is_system: true },
    { code: 'owner', name: 'Owner', display_order: 4, color: '#f97316', is_system: true },
    { code: 'company', name: 'Company', display_order: 5, color: '#06b6d4', is_system: true },
    { code: 'shared', name: 'Shared', display_order: 6, color: '#ec4899', is_system: true },
  ];
  for (const v of expenseAllocValues) {
    await upsertValue('settlement_expense_allocation', v);
  }

  // ────────────────────────────────────────────────────────────────
  // SETTLEMENT PAYMENT METHOD
  // ────────────────────────────────────────────────────────────────
  const settlementPayValues = [
    { code: 'bank_transfer', name: 'Bank Transfer', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'upi', name: 'UPI', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'cash', name: 'Cash', display_order: 3, color: '#8b5cf6', is_system: true },
    { code: 'cheque', name: 'Cheque', display_order: 4, color: '#f97316', is_system: true },
  ];
  for (const v of settlementPayValues) {
    await upsertValue('settlement_payment_method', v);
  }

  // ────────────────────────────────────────────────────────────────
  // SETTLEMENT TAX TYPE
  // ────────────────────────────────────────────────────────────────
  const taxTypeValues = [
    { code: 'gst', name: 'GST', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'tds', name: 'TDS', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'platform_deductions', name: 'Platform Deductions', display_order: 3, color: '#8b5cf6', is_system: true },
    { code: 'owner_deductions', name: 'Owner Deductions', display_order: 4, color: '#f97316', is_system: true },
    { code: 'adjustments', name: 'Adjustments', display_order: 5, color: '#06b6d4', is_system: true },
    { code: 'reimbursements', name: 'Reimbursements', display_order: 6, color: '#22c55e', is_system: true },
    { code: 'credits', name: 'Credits', display_order: 7, color: '#3b82f6', is_system: true },
    { code: 'debits', name: 'Debits', display_order: 8, color: '#ef4444', is_system: true },
  ];
  for (const v of taxTypeValues) {
    await upsertValue('settlement_tax_type', v);
  }

  // ────────────────────────────────────────────────────────────────
  // SETTLEMENT RECIPIENT TYPE
  // ────────────────────────────────────────────────────────────────
  const recipTypeValues = [
    { code: 'owner', name: 'Owner', display_order: 1, color: '#3b82f6', is_system: true },
    { code: 'marc8', name: 'Marc8', display_order: 2, color: '#22c55e', is_system: true },
    { code: 'platform', name: 'Platform', display_order: 3, color: '#8b5cf6', is_system: true },
  ];
  for (const v of recipTypeValues) {
    await upsertValue('settlement_recipient_type', v);
  }
}
