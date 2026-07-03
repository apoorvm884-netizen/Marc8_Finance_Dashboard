export interface NavSubItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
}

export interface NavItem {
  label: string;
  path?: string;
  icon: string;
  roles: string[];
  children?: NavSubItem[];
}

export const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'],
  },
  {
    label: 'Bookings',
    path: '/bookings',
    icon: 'CalendarCheck',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR'],
  },
  {
    label: 'Journal Ledger',
    path: '/journal-ledger',
    icon: 'BookOpen',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  {
    label: 'Expenses',
    path: '/expenses',
    icon: 'IndianRupee',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR'],
  },
  {
    label: 'Settlements',
    path: '/settlements',
    icon: 'IndianRupee',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'],
  },
  {
    label: 'Outstandings',
    path: '/outstandings',
    icon: 'CalendarClock',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR'],
  },
  {
    label: 'Fleet',
    icon: 'Truck',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR'],
    children: [
      {
        label: 'Dashboard',
        path: '/fleet',
        icon: 'LayoutDashboard',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'],
      },
      {
        label: 'Maintenance',
        path: '/maintenance',
        icon: 'Wrench',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR'],
      },
      {
        label: 'Service Schedules',
        path: '/service-schedules',
        icon: 'CalendarClock',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR'],
      },
    ],
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: 'FileText',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: 'Bell',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'],
  },
  {
    label: 'Operations',
    path: '/operations',
    icon: 'Settings2',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  {
    label: 'Automation',
    path: '/automation',
    icon: 'Zap',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  {
    label: 'Masters',
    icon: 'Database',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    children: [
      {
        label: 'Customers',
        path: '/masters/customers',
        icon: 'Users',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      },
      {
        label: 'Vendors',
        path: '/masters/vendors',
        icon: 'Building2',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      },
      {
        label: 'Drivers',
        path: '/masters/drivers',
        icon: 'UserCircle',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      },
      {
        label: 'Vehicles',
        path: '/masters/vehicles',
        icon: 'Car',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR'],
      },
      {
        label: 'Owners',
        path: '/vehicle-owners',
        icon: 'Users',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      },
      {
        label: 'Accounts',
        path: '/masters/accounts',
        icon: 'Wallet',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: 'Platforms',
        path: '/masters/data/platform',
        icon: 'Globe',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: 'Expense Categories',
        path: '/masters/data/expense_category',
        icon: 'Tags',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: 'Journal Categories',
        path: '/masters/data/journal_category',
        icon: 'BookType',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: 'Payment Modes',
        path: '/masters/data/payment_mode',
        icon: 'CreditCard',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: 'Fuel Types',
        path: '/masters/data/fuel_type',
        icon: 'Fuel',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      },
      {
        label: 'Vehicle Status',
        path: '/masters/data/vehicle_status',
        icon: 'CircleDot',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      },
      {
        label: 'Ownership Types',
        path: '/masters/data/ownership_type',
        icon: 'FileBadge',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      },
      {
        label: 'Transmission Types',
        path: '/masters/data/transmission_type',
        icon: 'Settings2',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      },
      {
        label: 'Outstanding Categories',
        path: '/masters/data/outstanding_category',
        icon: 'CalendarClock',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: 'Outstanding Priorities',
        path: '/masters/data/outstanding_priority',
        icon: 'ArrowUpDown',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: 'Platform Categories',
        path: '/masters/data/platform_category',
        icon: 'Globe',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    roles: ['SUPER_ADMIN'],
  },
];
