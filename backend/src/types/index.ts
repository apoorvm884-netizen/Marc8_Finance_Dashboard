import { Request } from 'express';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  username: string;
  email: string | null;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  is_active: boolean;
  is_first_login: boolean;
  last_login_at: string | null;
  restrictions: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateUserDTO {
  username: string;
  email?: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
  restrictions?: Record<string, unknown> | null;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthPayload {
  userId: string;
  username: string;
  role: UserRole;
  restrictions?: Record<string, unknown> | null;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
  stack?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
  stack?: string;
}

export type JournalStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface JournalEntry {
  id: string;
  vehicle_id: string;
  collection_date: string;
  amount_collected: number;
  total_amount: number;
  ledger_category_id: string;
  reference_number: string | null;
  description: string | null;
  remarks: string | null;
  status: JournalStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface CreateJournalEntryDTO {
  vehicle_id: string;
  collection_date?: string;
  amount_collected: number;
  total_amount: number;
  ledger_category_id: string;
  reference_number?: string;
  description?: string;
  status?: JournalStatus;
  remarks?: string;
}

export interface UpdateJournalEntryDTO {
  vehicle_id?: string;
  collection_date?: string;
  amount_collected?: number;
  total_amount?: number;
  ledger_category_id?: string;
  reference_number?: string;
  description?: string;
  status?: JournalStatus;
  remarks?: string;
}

export interface JournalMetrics {
  todays_collections: number;
  monthly_collections: number;
  collections_by_category: { category_id: string; category_name: string; total: number }[];
  collections_by_vehicle: { vehicle_id: string; vehicle_number: string; total: number }[];
  recent_entries: JournalEntry[];
}

export type OutstandingStatus = 'upcoming' | 'due_today' | 'overdue' | 'paid' | 'cancelled' | 'partially_paid';

export interface Outstanding {
  id: string;
  title: string;
  outstanding_category_id: string;
  vehicle_id: string | null;
  platform_id: string | null;
  vendor: string | null;
  amount: number;
  due_date: string;
  priority: string;
  status: OutstandingStatus;
  notes: string | null;
  paid_as_expense_id: string | null;
  paid_amount: number | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface CreateOutstandingDTO {
  title: string;
  outstanding_category_id: string;
  vehicle_id?: string | null;
  platform_id?: string | null;
  vendor?: string | null;
  amount: number;
  due_date: string;
  priority?: string;
  status?: OutstandingStatus;
  notes?: string | null;
}

export interface UpdateOutstandingDTO {
  title?: string;
  outstanding_category_id?: string;
  vehicle_id?: string | null;
  platform_id?: string | null;
  vendor?: string | null;
  amount?: number;
  due_date?: string;
  priority?: string;
  status?: OutstandingStatus;
  notes?: string | null;
}

export interface MarkAsPaidDTO {
  payment_mode_id: string;
  expense_category_id: string;
  paid_amount?: number;
  paid_date?: string;
  notes?: string | null;
}

export type Permission =
  | 'users:create' | 'users:read' | 'users:update' | 'users:delete'
  | 'users:activate' | 'users:deactivate'
  | 'vehicles:create' | 'vehicles:read' | 'vehicles:update' | 'vehicles:delete' | 'vehicles:restore'
  | 'bookings:create' | 'bookings:read' | 'bookings:update' | 'bookings:delete' | 'bookings:approve'
  | 'bookings:manage' | 'bookings:restore'
  | 'expenses:create' | 'expenses:read' | 'expenses:update' | 'expenses:delete' | 'expenses:approve' | 'expenses:restore'
  | 'outstandings:create' | 'outstandings:read' | 'outstandings:update' | 'outstandings:delete' | 'outstandings:restore'
  | 'outstandings:mark-paid'
  | 'reports:create' | 'reports:read' | 'reports:export'
  | 'audit:read'
  | 'masters:manage'
  | 'journal:create' | 'journal:read' | 'journal:update' | 'journal:delete' | 'journal:restore'
  | 'owners:create' | 'owners:read' | 'owners:update' | 'owners:delete' | 'owners:restore'
  | 'owners:assign' | 'owners:manage-documents'
  | 'settlements:create' | 'settlements:read' | 'settlements:update' | 'settlements:delete' | 'settlements:restore'
  | 'settlements:approve' | 'settlements:reject' | 'settlements:run-pipeline'
  | 'settlements:pay' | 'settlements:manage-documents'
  | 'workflow:manage' | 'workflow:transition'
  | 'approvals:manage' | 'approvals:approve'
  | 'tasks:create' | 'tasks:read' | 'tasks:update' | 'tasks:delete' | 'tasks:assign'
  | 'sla:manage'
  | 'escalation:manage'
  | 'activity:read';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'LOGIN' | 'LOGOUT' | 'CHANGE_PASSWORD' | 'ACTIVATE' | 'DEACTIVATE' | 'EXPORT' | 'IMPORT';
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type VehicleStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'INACTIVE';
export type FuelType = 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type OwnershipType = 'OWNED' | 'LEASED' | 'RENTAL' | 'CO_HOSTED_CLIENT';

export interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_name: string;
  brand: string | null;
  model: string | null;
  variant: string | null;
  year: number | null;
  color: string | null;
  fuel_type: FuelType | null;
  transmission: Transmission | null;
  ownership_type: OwnershipType | null;
  seating_capacity: number | null;
  chassis_number: string | null;
  engine_number: string | null;
  status: VehicleStatus;
  active_platform_id: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  current_odometer: number | null;
  insurance_expiry: string | null;
  permit_expiry: string | null;
  road_tax_expiry: string | null;
  pollution_expiry: string | null;
  fitness_expiry: string | null;
  rc_expiry: string | null;
  photo: string | null;
  notes: string | null;
  is_active: boolean;
  fleet_code: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface CreateVehicleDTO {
  vehicle_number: string;
  vehicle_name: string;
  fleet_code?: string;
  brand?: string;
  model?: string;
  variant?: string;
  year?: number;
  color?: string;
  fuel_type?: FuelType;
  transmission?: Transmission;
  ownership_type?: OwnershipType;
  seating_capacity?: number;
  chassis_number?: string;
  engine_number?: string;
  status?: VehicleStatus;
  active_platform_id?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_odometer?: number;
  insurance_expiry?: string;
  permit_expiry?: string;
  road_tax_expiry?: string;
  pollution_expiry?: string;
  fitness_expiry?: string;
  rc_expiry?: string;
  photo?: string;
  notes?: string;
}

export interface UpdateVehicleDTO {
  vehicle_number?: string;
  vehicle_name?: string;
  fleet_code?: string;
  brand?: string;
  model?: string;
  variant?: string;
  year?: number;
  color?: string;
  fuel_type?: FuelType;
  transmission?: Transmission;
  ownership_type?: OwnershipType;
  seating_capacity?: number;
  chassis_number?: string;
  engine_number?: string;
  status?: VehicleStatus;
  active_platform_id?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_odometer?: number;
  insurance_expiry?: string;
  permit_expiry?: string;
  road_tax_expiry?: string;
  pollution_expiry?: string;
  fitness_expiry?: string;
  rc_expiry?: string;
  photo?: string;
  notes?: string;
  is_active?: boolean;
}

export interface MasterType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MasterValue {
  id: string;
  master_type_id: string;
  code: string;
  name: string;
  description: string | null;
  display_order: number;
  color: string | null;
  icon: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateMasterValueDTO {
  code: string;
  name: string;
  description?: string;
  display_order?: number;
  color?: string;
  icon?: string;
  is_active?: boolean;
}

export interface UpdateMasterValueDTO {
  code?: string;
  name?: string;
  description?: string;
  display_order?: number;
  color?: string;
  icon?: string;
  is_active?: boolean;
}

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

export interface Expense {
  id: string;
  vehicle_id: string | null;
  expense_category_id: string;
  payment_mode_id: string;
  expense_date: string;
  amount: number;
  vendor: string | null;
  invoice_number: string | null;
  remarks: string | null;
  status: ExpenseStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface CreateExpenseDTO {
  vehicle_id?: string | null;
  expense_category_id: string;
  payment_mode_id: string;
  expense_date?: string;
  amount: number;
  vendor?: string | null;
  invoice_number?: string | null;
  status?: ExpenseStatus;
  remarks?: string | null;
}

export interface UpdateExpenseDTO {
  vehicle_id?: string | null;
  expense_category_id?: string;
  payment_mode_id?: string;
  expense_date?: string;
  amount?: number;
  vendor?: string | null;
  invoice_number?: string | null;
  status?: ExpenseStatus;
  remarks?: string | null;
}

export type PaymentStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export interface Booking {
  id: string;
  vehicle_id: string;
  platform_id: string;
  booking_id: string;
  booking_date_time: string;
  trip_start: string | null;
  trip_end: string | null;
  gross_fare: number;
  doorstep_charges: number;
  platform_commission: number;
  discount: number;
  taxes: number;
  refund: number;
  net_revenue: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  customer_name: string | null;
  customer_phone: string | null;
  start_km: number | null;
  end_km: number | null;
  pre_check_images: string[] | null;
  post_check_images: string[] | null;
  fastag_amount: number;
  fuel_amount: number;
  incidents_amount: number;
  washing_amount: number;
  cancellation_fee: number;
  late_return_fee: number;
  co_driver_fee: number;
  damage_amount: number;
  doorstep_delivery_fee: number;
  miscellaneous_amount: number;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface CreateBookingDTO {
  vehicle_id: string;
  platform_id: string;
  booking_id: string;
  booking_date_time: string;
  trip_start?: string;
  trip_end?: string;
  gross_fare: number;
  doorstep_charges: number;
  platform_commission: number;
  discount?: number;
  taxes?: number;
  refund?: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  customer_name?: string;
  customer_phone?: string;
  start_km?: number;
  end_km?: number;
  pre_check_images?: string[];
  post_check_images?: string[];
  fastag_amount?: number;
  fuel_amount?: number;
  incidents_amount?: number;
  washing_amount?: number;
  cancellation_fee?: number;
  late_return_fee?: number;
  co_driver_fee?: number;
  damage_amount?: number;
  doorstep_delivery_fee?: number;
  miscellaneous_amount?: number;
  remarks?: string;
}

export interface UpdateBookingDTO {
  vehicle_id?: string;
  platform_id?: string;
  booking_id?: string;
  booking_date_time?: string;
  trip_start?: string;
  trip_end?: string;
  gross_fare?: number;
  doorstep_charges?: number;
  platform_commission?: number;
  discount?: number;
  taxes?: number;
  refund?: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  customer_name?: string;
  customer_phone?: string;
  start_km?: number;
  end_km?: number;
  pre_check_images?: string[];
  post_check_images?: string[];
  fastag_amount?: number;
  fuel_amount?: number;
  incidents_amount?: number;
  washing_amount?: number;
  cancellation_fee?: number;
  late_return_fee?: number;
  co_driver_fee?: number;
  damage_amount?: number;
  doorstep_delivery_fee?: number;
  miscellaneous_amount?: number;
  remarks?: string;
}

export interface BookingDashboardMetrics {
  todays_revenue: number;
  monthly_revenue: number;
  revenue_by_platform: { platform_id: string; platform_name: string; total: number }[];
  revenue_by_vehicle: { vehicle_id: string; vehicle_number: string; total: number }[];
  latest_bookings: Booking[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export interface CompanyProfile {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  gst_number: string | null;
  currency: string;
  timezone: string;
  date_format: string;
  financial_year_start: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardSettings {
  id: string;
  default_dashboard: string;
  default_date_range: string;
  default_charts: Record<string, unknown>;
  widget_visibility: Record<string, unknown>;
  dashboard_layout: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FinancialSettings {
  id: string;
  default_currency: string;
  currency_symbol: string;
  decimal_precision: number;
  tax_percentage: number;
  invoice_prefix: string;
  booking_prefix: string;
  journal_prefix: string;
  expense_prefix: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  email_notifications: boolean;
  browser_notifications: boolean;
  reminder_settings: boolean;
  daily_summary: boolean;
  weekly_summary: boolean;
  monthly_summary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  theme: string;
  sidebar_state: string;
  language: string;
  table_density: string;
  default_page_size: number;
  created_at: string;
  updated_at: string;
}

export interface SecuritySettings {
  id: string;
  password_policy: Record<string, unknown>;
  session_timeout_minutes: number;
  two_factor_enabled: boolean;
  max_login_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface AllSettings {
  company: CompanyProfile;
  dashboard: DashboardSettings;
  financial: FinancialSettings;
  notifications: NotificationSettings;
  preferences: UserPreferences;
  security: SecuritySettings;
}

export interface UpdateCompanyProfileDTO {
  company_name?: string | null;
  logo_url?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  gst_number?: string | null;
  currency?: string;
  timezone?: string;
  date_format?: string;
  financial_year_start?: string;
}

export interface UpdateDashboardSettingsDTO {
  default_dashboard?: string;
  default_date_range?: string;
  default_charts?: Record<string, unknown>;
  widget_visibility?: Record<string, unknown>;
  dashboard_layout?: Record<string, unknown>;
}

export interface UpdateFinancialSettingsDTO {
  default_currency?: string;
  currency_symbol?: string;
  decimal_precision?: number;
  tax_percentage?: number;
  invoice_prefix?: string;
  booking_prefix?: string;
  journal_prefix?: string;
  expense_prefix?: string;
}

export interface UpdateNotificationSettingsDTO {
  email_notifications?: boolean;
  browser_notifications?: boolean;
  reminder_settings?: boolean;
  daily_summary?: boolean;
  weekly_summary?: boolean;
  monthly_summary?: boolean;
}

export interface UpdateUserPreferencesDTO {
  theme?: string;
  sidebar_state?: string;
  language?: string;
  table_density?: string;
  default_page_size?: number;
}

export interface UpdateSecuritySettingsDTO {
  password_policy?: Record<string, unknown>;
  session_timeout_minutes?: number;
  two_factor_enabled?: boolean;
  max_login_attempts?: number;
}

export type NotificationType = 'system' | 'success' | 'warning' | 'error' | 'info';

export type ReminderType =
  | 'insurance_renewal' | 'vehicle_service_due' | 'road_tax_due' | 'permit_expiry'
  | 'fastag_low_balance' | 'pending_journal_entries' | 'pending_expenses'
  | 'pending_bookings' | 'high_expense_alert' | 'negative_profit_alert'
  | 'inactive_vehicles' | 'vehicles_without_bookings';

export type ReminderStatus = 'PENDING' | 'COMPLETED' | 'DISMISSED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  is_archived: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationDTO {
  type: NotificationType;
  title: string;
  message?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  user_id?: string | null;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title_template: string;
  message_template: string | null;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateNotificationTemplateDTO {
  name?: string;
  type?: NotificationType;
  title_template?: string;
  message_template?: string | null;
  variables?: string[];
  is_active?: boolean;
}

export interface Reminder {
  id: string;
  reminder_type: ReminderType;
  vehicle_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  remind_before_days: number;
  is_recurring: boolean;
  recurring_interval_days: number | null;
  last_triggered_at: string | null;
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateReminderDTO {
  reminder_type: ReminderType;
  vehicle_id?: string | null;
  title: string;
  description?: string | null;
  due_date: string;
  remind_before_days?: number;
  is_recurring?: boolean;
  recurring_interval_days?: number | null;
  status?: ReminderStatus;
}

export interface UpdateReminderDTO {
  reminder_type?: ReminderType;
  vehicle_id?: string | null;
  title?: string;
  description?: string | null;
  due_date?: string;
  remind_before_days?: number;
  is_recurring?: boolean;
  recurring_interval_days?: number | null;
  status?: ReminderStatus;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  reminder_days_before: number;
  daily_summary: boolean;
  weekly_summary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateNotificationPreferencesDTO {
  in_app_enabled?: boolean;
  email_enabled?: boolean;
  reminder_days_before?: number;
  daily_summary?: boolean;
  weekly_summary?: boolean;
}

export interface NotificationHistory {
  id: string;
  notification_id: string | null;
  reminder_id: string | null;
  user_id: string | null;
  action: string;
  channel: string;
  created_at: string;
}

// Vehicle Owner Types
export type OwnerType = 'company_owned' | 'client_owned' | 'partner_owned' | 'investor_owned';
export type OwnershipStatus = 'active' | 'suspended' | 'inactive';
export type AgreementStatus = 'active' | 'expired' | 'terminated' | 'renewed';
export type OwnerDocumentStatus = 'active' | 'expired' | 'expiring_soon';
export type DocType = 'agreement' | 'pan' | 'aadhaar' | 'gst_certificate' | 'cancelled_cheque' | 'rc_copy' | 'insurance_copy' | 'other';
export type OwnershipEventType = 'owner_assigned' | 'owner_changed' | 'agreement_renewed' | 'ownership_transferred' | 'ownership_suspended' | 'ownership_reactivated' | 'ownership_ended';

export interface VehicleOwner {
  id: string;
  owner_type: OwnerType;
  name: string;
  contact_person: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  pan: string | null;
  aadhaar: string | null;
  gst: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  bank_ifsc: string | null;
  upi_id: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  agreement_number: string | null;
  agreement_start_date: string | null;
  agreement_end_date: string | null;
  ownership_status: OwnershipStatus;
  agreement_status: AgreementStatus;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  // Joined fields
  linked_vehicles?: { id: string; vehicle_number: string; vehicle_name: string }[];
}

export interface CreateVehicleOwnerDTO {
  owner_type: OwnerType;
  name: string;
  contact_person?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  pan?: string | null;
  aadhaar?: string | null;
  gst?: string | null;
  bank_account_number?: string | null;
  bank_name?: string | null;
  bank_ifsc?: string | null;
  upi_id?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  agreement_number?: string | null;
  agreement_start_date?: string | null;
  agreement_end_date?: string | null;
  ownership_status?: OwnershipStatus;
  agreement_status?: AgreementStatus;
  notes?: string | null;
  is_active?: boolean;
}

export interface UpdateVehicleOwnerDTO {
  owner_type?: OwnerType;
  name?: string;
  contact_person?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  pan?: string | null;
  aadhaar?: string | null;
  gst?: string | null;
  bank_account_number?: string | null;
  bank_name?: string | null;
  bank_ifsc?: string | null;
  upi_id?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  agreement_number?: string | null;
  agreement_start_date?: string | null;
  agreement_end_date?: string | null;
  ownership_status?: OwnershipStatus;
  agreement_status?: AgreementStatus;
  notes?: string | null;
  is_active?: boolean;
}

export interface OwnerDocument {
  id: string;
  owner_id: string;
  document_type: DocType;
  document_name: string;
  file_url: string | null;
  expiry_date: string | null;
  status: OwnerDocumentStatus;
  version: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateOwnerDocumentDTO {
  document_type: DocType;
  document_name: string;
  file_url?: string | null;
  expiry_date?: string | null;
  status?: OwnerDocumentStatus;
  notes?: string | null;
}

export interface UpdateOwnerDocumentDTO {
  document_type?: DocType;
  document_name?: string;
  file_url?: string | null;
  expiry_date?: string | null;
  status?: OwnerDocumentStatus;
  notes?: string | null;
}

export interface OwnershipHistory {
  id: string;
  vehicle_id: string;
  owner_id: string | null;
  event_type: OwnershipEventType;
  event_date: string;
  previous_owner_name: string | null;
  new_owner_name: string | null;
  previous_agreement_number: string | null;
  new_agreement_number: string | null;
  previous_status: string | null;
  new_status: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  created_by: string | null;
}

export interface CreateOwnershipHistoryDTO {
  vehicle_id: string;
  owner_id?: string | null;
  event_type: OwnershipEventType;
  event_date?: string;
  previous_owner_name?: string | null;
  new_owner_name?: string | null;
  previous_agreement_number?: string | null;
  new_agreement_number?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

// ============= SETTLEMENT TYPES =============

export type SettlementStatus =
  | 'draft' | 'calculated' | 'pending_approval' | 'approved' | 'rejected'
  | 'payment_initiated' | 'paid' | 'partially_paid' | 'cancelled' | 'closed';

export type SettlementRevenueModel =
  | 'fixed_monthly' | 'revenue_share_percent' | 'profit_share_percent'
  | 'hybrid' | 'minimum_guarantee' | 'custom_formula';

export type SettlementType = 'owner' | 'platform';

export interface Settlement {
  id: string;
  settlement_number: string;
  period_start: string;
  period_end: string;
  owner_id: string | null;
  vehicle_id: string | null;
  platform_id: string | null;
  settlement_type: SettlementType;
  total_gross_revenue: number;
  total_platform_commission: number;
  total_taxes: number;
  total_adjustments: number;
  total_approved_expenses: number;
  net_revenue: number;
  owner_share: number;
  marc8_share: number;
  revenue_model: string;
  owner_revenue_percentage: number | null;
  status: SettlementStatus;
  total_paid: number;
  balance_due: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface CreateSettlementDTO {
  period_start: string;
  period_end: string;
  owner_id?: string | null;
  vehicle_id?: string | null;
  platform_id?: string | null;
  settlement_type?: SettlementType;
  revenue_model?: string;
  notes?: string | null;
}

export interface UpdateSettlementDTO {
  period_start?: string;
  period_end?: string;
  owner_id?: string | null;
  vehicle_id?: string | null;
  platform_id?: string | null;
  settlement_type?: SettlementType;
  revenue_model?: string;
  notes?: string | null;
  status?: SettlementStatus;
}

export interface SettlementBooking {
  id: string;
  settlement_id: string;
  booking_id: string;
  gross_fare: number;
  doorstep_charges: number;
  platform_commission: number;
  discount: number;
  taxes: number;
  net_revenue: number;
  created_at: string;
}

export interface SettlementExpense {
  id: string;
  settlement_id: string;
  expense_id: string;
  allocation_type: string;
  amount: number;
  created_at: string;
}

export interface SettlementDistribution {
  id: string;
  settlement_id: string;
  recipient_type: string;
  recipient_name: string;
  amount: number;
  percentage: number | null;
  description: string | null;
  created_at: string;
}

export interface SettlementApproval {
  id: string;
  settlement_id: string;
  approved_by: string;
  approved_at: string;
  status: string;
  remarks: string | null;
  created_at: string;
}

export interface SettlementPayment {
  id: string;
  settlement_id: string;
  payment_method: string;
  amount: number;
  payment_date: string;
  reference_number: string | null;
  transaction_id: string | null;
  remarks: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateSettlementPaymentDTO {
  payment_method: string;
  amount: number;
  payment_date: string;
  reference_number?: string | null;
  transaction_id?: string | null;
  remarks?: string | null;
}

export interface SettlementDocument {
  id: string;
  settlement_id: string;
  document_name: string;
  file_url: string | null;
  document_type: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface CreateSettlementDocumentDTO {
  document_name: string;
  file_url?: string | null;
  document_type?: string | null;
  notes?: string | null;
}

export interface RunPipelineDTO {
  period_start: string;
  period_end: string;
  owner_id?: string | null;
  vehicle_id?: string | null;
  platform_id?: string | null;
  revenue_model?: string;
  notes?: string | null;
}

// ============= WORKFLOW ENGINE TYPES =============

export interface WorkflowDefinition {
  id: string;
  entity_type: string;
  name: string;
  states: WorkflowStateDef[];
  transitions: WorkflowTransitionDef[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface WorkflowStateDef {
  name: string;
  label: string;
  description?: string;
  is_terminal?: boolean;
  color?: string;
}

export interface WorkflowTransitionDef {
  from_state: string;
  to_state: string;
  action: string;
  label: string;
  required_role?: string;
  requires_approval?: boolean;
}

export interface CreateWorkflowDefinitionDTO {
  entity_type: string;
  name: string;
  states: WorkflowStateDef[];
  transitions: WorkflowTransitionDef[];
}

export interface UpdateWorkflowDefinitionDTO {
  name?: string;
  states?: WorkflowStateDef[];
  transitions?: WorkflowTransitionDef[];
  is_active?: boolean;
}

export interface WorkflowInstance {
  id: string;
  workflow_definition_id: string;
  entity_type: string;
  entity_id: string;
  current_state: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface WorkflowLog {
  id: string;
  workflow_instance_id: string;
  from_state: string | null;
  to_state: string;
  action: string;
  comment: string | null;
  performed_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TransitionWorkflowDTO {
  action: string;
  comment?: string;
  metadata?: Record<string, unknown>;
}

// ============= APPROVAL ENGINE TYPES =============

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ApprovalRequest {
  id: string;
  entity_type: string;
  entity_id: string;
  request_type: string;
  status: ApprovalStatus;
  requested_by: string | null;
  level: number;
  max_level: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Joined
  levels?: ApprovalLevel[];
  requested_by_name?: string;
}

export interface ApprovalLevel {
  id: string;
  approval_request_id: string;
  level_number: number;
  required_roles: string[] | null;
  required_users: string[] | null;
  actual_approvers: string[] | null;
  status: ApprovalStatus;
  created_at: string;
  updated_at: string;
  // Joined
  actions?: ApprovalAction[];
}

export interface ApprovalAction {
  id: string;
  approval_level_id: string;
  approval_request_id: string;
  action: 'approved' | 'rejected';
  comment: string | null;
  performed_by: string | null;
  created_at: string;
  performed_by_name?: string;
}

export interface CreateApprovalRequestDTO {
  entity_type: string;
  entity_id: string;
  request_type: string;
  levels: {
    level_number: number;
    required_roles?: string[];
    required_users?: string[];
  }[];
  metadata?: Record<string, unknown>;
}

export interface ApproveRejectDTO {
  action: 'approved' | 'rejected';
  comment?: string;
}

// ============= TASK ENGINE TYPES =============

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  // Joined
  assigned_to_name?: string;
  assigned_by_name?: string;
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  comment: string;
  created_by: string | null;
  created_at: string;
  created_by_name?: string;
}

export interface CreateTaskDTO {
  entity_type?: string;
  entity_id?: string;
  title: string;
  description?: string;
  assigned_to?: string;
  priority?: TaskPriority;
  due_at?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  assigned_to?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_at?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateTaskCommentDTO {
  comment: string;
}

// ============= SLA ENGINE TYPES =============

export interface SLADefinition {
  id: string;
  entity_type: string;
  name: string;
  from_status: string | null;
  to_status: string;
  sla_hours: number;
  severity: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSLADefinitionDTO {
  entity_type: string;
  name: string;
  from_status?: string;
  to_status: string;
  sla_hours: number;
  severity?: string;
}

export interface UpdateSLADefinitionDTO {
  name?: string;
  from_status?: string | null;
  to_status?: string;
  sla_hours?: number;
  severity?: string;
  is_active?: boolean;
}

export interface SLABreach {
  id: string;
  sla_definition_id: string;
  entity_type: string;
  entity_id: string;
  expected_at: string;
  breached_at: string | null;
  status: string;
  resolved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============= ESCALATION ENGINE TYPES =============

export interface EscalationRule {
  id: string;
  sla_definition_id: string | null;
  entity_type: string;
  name: string;
  trigger_after_minutes: number;
  escalate_to_role: string | null;
  escalate_to_user: string | null;
  notify: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEscalationRuleDTO {
  sla_definition_id?: string;
  entity_type: string;
  name: string;
  trigger_after_minutes: number;
  escalate_to_role?: string;
  escalate_to_user?: string;
  notify?: boolean;
}

export interface UpdateEscalationRuleDTO {
  name?: string;
  trigger_after_minutes?: number;
  escalate_to_role?: string | null;
  escalate_to_user?: string | null;
  notify?: boolean;
  is_active?: boolean;
}

export interface EscalationInstance {
  id: string;
  escalation_rule_id: string;
  sla_breach_id: string | null;
  escalated_to: string | null;
  escalated_by: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============= ACTIVITY TIMELINE TYPES =============

export interface ActivityLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  description: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  performed_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  // Joined
  performed_by_name?: string;
}

export interface CreateActivityLogDTO {
  entity_type: string;
  entity_id: string;
  action: string;
  description?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  performed_by?: string;
  metadata?: Record<string, unknown>;
}

export interface SettlementDashboardMetrics {
  total_settlements: number;
  settlement_due_amount: number;
  settlement_paid_amount: number;
  pending_approvals: number;
  upcoming_payouts: number;
  owner_liability: number;
  platform_liability: number;
  cash_requirement: number;
  monthly_distribution: { month: string; amount: number }[];
  top_owners: { owner_id: string; owner_name: string; total_amount: number }[];
  distribution_trends: { month: string; owner_share: number; marc8_share: number }[];
}

// ============= AUTOMATION ENGINE TYPES =============

export interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  event_type: string | null;
  conditions: AutomationCondition[];
  actions: AutomationActionDef[];
  schedule_config: Record<string, unknown> | null;
  is_active: boolean;
  priority: number;
  cooldown_minutes: number;
  max_executions: number;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface AutomationCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';
  value: unknown;
}

export interface AutomationActionDef {
  type: 'create_notification' | 'create_task' | 'create_alert' | 'create_recommendation' | 'trigger_workflow' | 'send_email';
  config: Record<string, unknown>;
}

export interface CreateAutomationRuleDTO {
  name: string;
  description?: string;
  event_type?: string;
  conditions?: AutomationCondition[];
  actions: AutomationActionDef[];
  schedule_config?: Record<string, unknown>;
  is_active?: boolean;
  priority?: number;
  cooldown_minutes?: number;
  max_executions?: number;
}

export interface UpdateAutomationRuleDTO {
  name?: string;
  description?: string | null;
  event_type?: string | null;
  conditions?: AutomationCondition[];
  actions?: AutomationActionDef[];
  schedule_config?: Record<string, unknown> | null;
  is_active?: boolean;
  priority?: number;
  cooldown_minutes?: number;
  max_executions?: number;
}

export interface AutomationExecution {
  id: string;
  automation_rule_id: string;
  event_type: string | null;
  entity_type: string | null;
  entity_id: string | null;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';
  trigger_type: 'event' | 'schedule' | 'manual';
  result: Record<string, unknown> | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  // Joined
  rule_name?: string;
}

// ============= SCHEDULER TYPES =============

export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface ScheduledJob {
  id: string;
  name: string;
  automation_rule_id: string | null;
  job_type: string;
  schedule_type: ScheduleType;
  cron_expression: string | null;
  schedule_config: Record<string, unknown> | null;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  retry_on_failure: boolean;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledJobDTO {
  name: string;
  automation_rule_id?: string;
  job_type: string;
  schedule_type: ScheduleType;
  cron_expression?: string;
  schedule_config?: Record<string, unknown>;
  is_active?: boolean;
  retry_on_failure?: boolean;
  max_retries?: number;
}

export interface UpdateScheduledJobDTO {
  name?: string;
  automation_rule_id?: string | null;
  schedule_type?: ScheduleType;
  cron_expression?: string | null;
  schedule_config?: Record<string, unknown> | null;
  is_active?: boolean;
  retry_on_failure?: boolean;
  max_retries?: number;
}

export interface ScheduledJobExecution {
  id: string;
  scheduled_job_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  result: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

// ============= INTELLIGENCE TYPES =============

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationStatus = 'open' | 'actioned' | 'dismissed';

export interface BusinessAlert {
  id: string;
  alert_type: string;
  title: string;
  description: string | null;
  severity: AlertSeverity;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  created_by: string | null;
}

export interface CreateBusinessAlertDTO {
  alert_type: string;
  title: string;
  description?: string;
  severity?: AlertSeverity;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_by?: string;
}

export interface Recommendation {
  id: string;
  recommendation_type: string;
  title: string;
  description: string | null;
  priority: RecommendationPriority;
  entity_type: string | null;
  entity_id: string | null;
  supporting_data: Record<string, unknown> | null;
  status: RecommendationStatus;
  actioned_at: string | null;
  actioned_by: string | null;
  created_at: string;
}

export interface CreateRecommendationDTO {
  recommendation_type: string;
  title: string;
  description?: string;
  priority?: RecommendationPriority;
  entity_type?: string;
  entity_id?: string;
  supporting_data?: Record<string, unknown>;
}
