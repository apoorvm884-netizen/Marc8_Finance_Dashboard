export const VEHICLE_STATUSES = {
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE: 'INACTIVE',
} as const;

export const FUEL_TYPES = {
  DIESEL: 'DIESEL',
  PETROL: 'PETROL',
  CNG: 'CNG',
  ELECTRIC: 'ELECTRIC',
} as const;

export const TRANSMISSIONS = {
  MANUAL: 'MANUAL',
  AUTOMATIC: 'AUTOMATIC',
} as const;

export const OWNERSHIP_TYPES = {
  OWNED: 'OWNED',
  LEASED: 'LEASED',
  RENTAL: 'RENTAL',
  CO_HOSTED_CLIENT: 'CO_HOSTED_CLIENT',
} as const;

export const VEHICLE_ALLOWED_SORT_FIELDS = [
  'vehicle_number',
  'vehicle_name',
  'brand',
  'model',
  'variant',
  'year',
  'status',
  'fuel_type',
  'fleet_code',
  'purchase_date',
  'purchase_price',
  'current_odometer',
  'insurance_expiry',
  'fitness_expiry',
  'pollution_expiry',
  'created_at',
  'updated_at',
] as const;

export const BOOKING_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
} as const;

export const JOURNAL_STATUSES = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const EXPENSE_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REIMBURSED: 'REIMBURSED',
} as const;

export const BOOKING_ALLOWED_SORT_FIELDS = [
  'booking_id',
  'booking_date_time',
  'gross_fare',
  'net_revenue',
  'status',
  'payment_status',
  'created_at',
  'updated_at',
] as const;

export const JOURNAL_ALLOWED_SORT_FIELDS = [
  'collection_date',
  'amount_collected',
  'total_amount',
  'status',
  'created_at',
] as const;

export const EXPENSE_ALLOWED_SORT_FIELDS = [
  'expense_date',
  'amount',
  'status',
  'vendor',
  'created_at',
  'updated_at',
] as const;
