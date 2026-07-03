import type { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  await knex('master_values').del();
  await knex('master_types').del();

  const now = knex.fn.now();
  const isSystem = true;

  // ----------------------------------------------------------------
  // Master Types
  // ----------------------------------------------------------------
  const types: { id: string; code: string; name: string; description: string | null; is_active: boolean; created_at: unknown; updated_at: unknown }[] = [
    { id: uuidv4(), code: 'platform', name: 'Platforms', description: 'Digital platforms where vehicles are managed', is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), code: 'expense_category', name: 'Expense Categories', description: 'Categories for classifying expenses', is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), code: 'journal_category', name: 'Journal Categories', description: 'Categories for journal entries', is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), code: 'payment_mode', name: 'Payment Modes', description: 'Available modes of payment', is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), code: 'fuel_type', name: 'Fuel Types', description: 'Types of fuel used by vehicles', is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), code: 'vehicle_status', name: 'Vehicle Status', description: 'Operational statuses for vehicles', is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), code: 'ownership_type', name: 'Ownership Types', description: 'Types of vehicle ownership', is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), code: 'transmission_type', name: 'Transmission Types', description: 'Types of vehicle transmission', is_active: true, created_at: now, updated_at: now },
  ];

  await knex('master_types').insert(types);

  const typeMap: Record<string, string> = {};
  for (const t of types) {
    typeMap[t.code] = t.id;
  }

  // ----------------------------------------------------------------
  // Master Values
  // ----------------------------------------------------------------
  const values: any[] = [];

  // fuel_type
  const fuelTypeId = typeMap['fuel_type'];
  values.push(
    { id: uuidv4(), master_type_id: fuelTypeId, code: 'DIESEL', name: 'Diesel', display_order: 1, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: fuelTypeId, code: 'PETROL', name: 'Petrol', display_order: 2, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: fuelTypeId, code: 'CNG', name: 'CNG', display_order: 3, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: fuelTypeId, code: 'ELECTRIC', name: 'Electric', display_order: 4, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
  );

  // vehicle_status
  const vehicleStatusId = typeMap['vehicle_status'];
  values.push(
    { id: uuidv4(), master_type_id: vehicleStatusId, code: 'AVAILABLE', name: 'Available', display_order: 1, color: '#10B981', icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: vehicleStatusId, code: 'BOOKED', name: 'Booked', display_order: 2, color: '#3B82F6', icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: vehicleStatusId, code: 'MAINTENANCE', name: 'Maintenance', display_order: 3, color: '#F59E0B', icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: vehicleStatusId, code: 'INACTIVE', name: 'Inactive', display_order: 4, color: '#6B7280', icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
  );

  // ownership_type
  const ownershipTypeId = typeMap['ownership_type'];
  values.push(
    { id: uuidv4(), master_type_id: ownershipTypeId, code: 'OWNED', name: 'Owned', display_order: 1, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: ownershipTypeId, code: 'LEASED', name: 'Leased', display_order: 2, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: ownershipTypeId, code: 'RENTAL', name: 'Rental', display_order: 3, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
  );

  // transmission_type
  const transmissionTypeId = typeMap['transmission_type'];
  values.push(
    { id: uuidv4(), master_type_id: transmissionTypeId, code: 'MANUAL', name: 'Manual', display_order: 1, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: transmissionTypeId, code: 'AUTOMATIC', name: 'Automatic', display_order: 2, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
  );

  // expense_category
  const expenseCatId = typeMap['expense_category'];
  const expenseCategories = ['FUEL', 'MAINTENANCE', 'REPAIR', 'TOLL', 'PARKING', 'INSURANCE', 'TAX', 'SALARY', 'RENT', 'UTILITIES', 'OFFICE', 'TRAVEL', 'MISC'];
  expenseCategories.forEach((code, index) => {
    values.push({
      id: uuidv4(),
      master_type_id: expenseCatId,
      code,
      name: code.charAt(0) + code.slice(1).toLowerCase(),
      display_order: index + 1,
      color: null,
      icon: null,
      is_system: isSystem,
      is_active: true,
      created_at: now,
      updated_at: now,
    });
  });

  // payment_mode
  const paymentModeId = typeMap['payment_mode'];
  values.push(
    { id: uuidv4(), master_type_id: paymentModeId, code: 'CASH', name: 'Cash', display_order: 1, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: paymentModeId, code: 'UPI', name: 'UPI', display_order: 2, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: paymentModeId, code: 'BANK_TRANSFER', name: 'Bank Transfer', display_order: 3, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: paymentModeId, code: 'CREDIT_CARD', name: 'Credit Card', display_order: 4, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: paymentModeId, code: 'DEBIT_CARD', name: 'Debit Card', display_order: 5, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: paymentModeId, code: 'CHEQUE', name: 'Cheque', display_order: 6, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: paymentModeId, code: 'ONLINE', name: 'Online', display_order: 7, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
  );

  // journal_category
  const journalCatId = typeMap['journal_category'];
  values.push(
    { id: uuidv4(), master_type_id: journalCatId, code: 'REVENUE', name: 'Revenue', display_order: 1, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: journalCatId, code: 'EXPENSE', name: 'Expense', display_order: 2, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: journalCatId, code: 'ASSET', name: 'Asset', display_order: 3, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: journalCatId, code: 'LIABILITY', name: 'Liability', display_order: 4, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: journalCatId, code: 'EQUITY', name: 'Equity', display_order: 5, color: null, icon: null, is_system: isSystem, is_active: true, created_at: now, updated_at: now },
  );

  // platform (is_system = false — editable via UI)
  const platformId = typeMap['platform'];
  values.push(
    { id: uuidv4(), master_type_id: platformId, code: 'UBER', name: 'Uber', display_order: 1, color: null, icon: null, is_system: false, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: platformId, code: 'OLA', name: 'Ola', display_order: 2, color: null, icon: null, is_system: false, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: platformId, code: 'RAPIDO', name: 'Rapido', display_order: 3, color: null, icon: null, is_system: false, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: platformId, code: 'SWIGGY', name: 'Swiggy', display_order: 4, color: null, icon: null, is_system: false, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: platformId, code: 'ZOMATO', name: 'Zomato', display_order: 5, color: null, icon: null, is_system: false, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: platformId, code: 'AMAZON_FLEX', name: 'Amazon Flex', display_order: 6, color: null, icon: null, is_system: false, is_active: true, created_at: now, updated_at: now },
    { id: uuidv4(), master_type_id: platformId, code: 'OTHER', name: 'Other', display_order: 7, color: null, icon: null, is_system: false, is_active: true, created_at: now, updated_at: now },
  );

  await knex('master_values').insert(values);
}
