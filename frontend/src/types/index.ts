export interface User {
  id: string;
  username: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  is_first_login: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirstLogin: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';
  value: unknown;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export type {
  Vehicle,
  CreateVehicleDTO,
  UpdateVehicleDTO,
  VehicleQueryParams,
  VehicleStatus,
  FuelType,
  Transmission,
  OwnershipType,
} from './vehicle';

export type { MasterType, MasterValue, CreateMasterValueDTO, UpdateMasterValueDTO } from './master';
export type { Booking, CreateBookingDTO, UpdateBookingDTO, BookingStatus, BookingDashboardMetrics } from './booking';
export type { JournalEntry, CreateJournalEntryDTO, UpdateJournalEntryDTO, JournalStatus, JournalMetrics } from './journal';
export type { Expense, CreateExpenseDTO, UpdateExpenseDTO, ExpenseStatus } from './expense';
export type {
  Outstanding, CreateOutstandingDTO, UpdateOutstandingDTO, MarkAsPaidDTO,
  OutstandingStatus, OutstandingPriority, PaymentPlannerData, CashRequirementForecast,
  VehicleFinancialIntelligence, PlatformAnalyticsData,
} from './outstanding';

export type { Vendor, CreateVendorDTO, UpdateVendorDTO, VendorQueryParams } from './vendor';
export type {
  MaintenanceRecord, MaintenancePart, CreateMaintenanceDTO, UpdateMaintenanceDTO,
  CreateMaintenancePartDTO, MaintenanceQueryParams, VehicleMaintenanceSummary, FleetHealth,
} from './maintenance';
export type { PlatformAssignment, CreateAssignmentDTO, EndAssignmentDTO, AssignmentQueryParams } from './platform-assignment';
export type {
  ServiceSchedule, CreateScheduleDTO, UpdateScheduleDTO, ScheduleQueryParams,
  UpcomingService, OverdueService, UpcomingServicesResult,
} from './scheduler';
export type { TimelineEvent, CreateTimelineEventDTO, DocumentStatus, VehicleIntelligence } from './vehicle-lifecycle';
export type {
  WorkflowDefinition, WorkflowStateDef, WorkflowTransitionDef,
  WorkflowInstance, WorkflowLog,
  ApprovalRequest, ApprovalLevel, ApprovalAction,
  Task, TaskComment, TaskSummary,
  SLADefinition, SLABreach,
  EscalationRule, EscalationInstance,
  ActivityLogEntry,
} from './workflow';
export type {
  AutomationRule, AutomationExecution, AutomationSummary,
  ScheduledJob, ScheduledJobExecution,
  BusinessAlert, Recommendation,
} from './automation';
