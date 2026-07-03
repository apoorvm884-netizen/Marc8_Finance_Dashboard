import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const labelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  bookings: 'Bookings',
  'journal-ledger': 'Journal Ledger',
  expenses: 'Expenses',
  outstandings: 'Outstandings',
  fleet: 'Fleet',
  maintenance: 'Maintenance',
  'service-schedules': 'Service Schedules',
  analytics: 'Analytics',
  reports: 'Reports',
  notifications: 'Notifications',
  masters: 'Masters',
  customers: 'Customers',
  vendors: 'Vendors',
  drivers: 'Drivers',
  vehicles: 'Vehicles',
  accounts: 'Accounts',
  data: 'Data',
  settings: 'Settings',
};

export function Breadcrumb({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-xs', className)}>
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-secondary-500 hover:text-white transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-secondary-600" />
            {isLast ? (
              <span className="text-white font-medium">{label}</span>
            ) : (
              <Link to={path} className="text-secondary-500 hover:text-white transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
