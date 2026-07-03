export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  MANAGE_USERS: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  MANAGE_ROLES: [ROLES.SUPER_ADMIN],
  VIEW_REPORTS: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_BOOKINGS: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR],
  MANAGE_EXPENSES: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR],
  MANAGE_FLEET: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_MASTERS: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
  VIEW_ANALYTICS: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_SETTINGS: [ROLES.SUPER_ADMIN],
} as const;

export const STORAGE_KEYS = {
  AUTH: 'ffd-auth',
  THEME: 'ffd-theme',
  SIDEBAR: 'ffd-sidebar',
  LANGUAGE: 'ffd-language',
  RECENT_PAGES: 'ffd-recent-pages',
} as const;

export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'],
    SESSION: ['auth', 'session'],
  },
  DASHBOARD: {
    STATS: ['dashboard', 'stats'],
    RECENT: ['dashboard', 'recent'],
    CHARTS: ['dashboard', 'charts'],
  },
  BOOKINGS: {
    LIST: ['bookings'],
    DETAIL: (id: string) => ['bookings', id],
    STATS: ['bookings', 'stats'],
  },
  EXPENSES: {
    LIST: ['expenses'],
    DETAIL: (id: string) => ['expenses', id],
    SUMMARY: ['expenses', 'summary'],
  },
  FLEET: {
    LIST: ['fleet'],
    DETAIL: (id: string) => ['fleet', id],
    STATUS: ['fleet', 'status'],
  },
  CUSTOMERS: {
    LIST: ['customers'],
    DETAIL: (id: string) => ['customers', id],
  },
  VENDORS: {
    LIST: ['vendors'],
    DETAIL: (id: string) => ['vendors', id],
  },
  DRIVERS: {
    LIST: ['drivers'],
    DETAIL: (id: string) => ['drivers', id],
  },
  VEHICLES: {
    LIST: ['vehicles'],
    DETAIL: (id: string) => ['vehicles', id],
  },
  VEHICLE_OWNERS: {
    LIST: ['vehicle-owners'],
    DETAIL: (id: string) => ['vehicle-owners', id],
    DOCUMENTS: (id: string) => ['vehicle-owners', id, 'documents'],
    VEHICLES: (id: string) => ['vehicle-owners', id, 'vehicles'],
  },
  SETTLEMENTS: {
    LIST: ['settlements'],
    DETAIL: (id: string) => ['settlements', id],
    DASHBOARD: ['settlements', 'dashboard'],
    METRICS: ['settlements', 'metrics'],
    PAYMENTS: (id: string) => ['settlements', id, 'payments'],
    DOCUMENTS: (id: string) => ['settlements', id, 'documents'],
  },
  ACCOUNTS: {
    LIST: ['accounts'],
    DETAIL: (id: string) => ['accounts', id],
    LEDGER: (id: string) => ['accounts', 'ledger', id],
  },
  JOURNAL: {
    LIST: ['journal'],
    DETAIL: (id: string) => ['journal', id],
  },
  REPORTS: {
    PROFIT_LOSS: ['reports', 'profit-loss'],
    CASH_FLOW: ['reports', 'cash-flow'],
    TAX: ['reports', 'tax'],
  },
  ANALYTICS: {
    REVENUE: ['analytics', 'revenue'],
    EXPENSES: ['analytics', 'expenses'],
    UTILIZATION: ['analytics', 'utilization'],
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100] as const,
  MAX_PAGE_SIZE: 100,
};

export const DATE_FORMATS = {
  DEFAULT: 'dd/MM/yyyy',
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy, hh:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
} as const;


