import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronDown,
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  BookOpen,
  IndianRupee,
  Truck,
  BarChart3,
  FileText,
  Database,
  Users,
  Building2,
  UserCircle,
  Car,
  Wallet,
  Settings,
  ArrowUpDown,
  Bell,
  Wrench,
  Globe,
  Tags,
  BookType,
  CreditCard,
  Fuel,
  CircleDot,
  FileBadge,
  Settings2,
  History,
  Star,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useAuth } from '@/hooks/use-auth';
import { cn, getInitials } from '@/lib/utils';
import { appConfig } from '@/config';
import { navigation, type NavItem } from '@/config/navigation';
import * as Tooltip from '@radix-ui/react-tooltip';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, CalendarCheck, CalendarClock, BookOpen, IndianRupee,
  Truck, BarChart3, FileText, Database, Users, Building2, UserCircle,
  Car, Wallet, Settings, ArrowUpDown, Bell, Wrench, Globe, Tags,
  BookType, CreditCard, Fuel, CircleDot, FileBadge, Settings2, History, Star, Zap,
};

function NavIcon({ icon }: { icon: string }) {
  const Icon = iconMap[icon];
  if (!Icon) return null;
  return <Icon className="h-5 w-5 shrink-0" />;
}

const sections: { label?: string; keys: string[] }[] = [
  { label: 'Overview', keys: ['Dashboard'] },
  { label: 'Operations', keys: ['Bookings', 'Journal Ledger', 'Expenses', 'Outstandings', 'Fleet'] },
  { label: 'Workflow', keys: ['Operations', 'Automation'] },
  { label: 'Intelligence', keys: ['Analytics', 'Reports', 'Notifications'] },
  { label: 'Administration', keys: ['Masters', 'Settings'] },
];

function SidebarNavItem({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;
  if (!item.roles.includes(user.role)) return null;

  const childrenArr = item.children;
  const hasChildren = childrenArr && childrenArr.length > 0;
  const isActive = hasChildren
    ? childrenArr.some((child) => location.pathname.startsWith(child.path))
    : location.pathname === item.path;

  const content = !hasChildren && item.path ? (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive: navActive }) =>
        cn('sidebar-item w-full', navActive && 'active')
      }
    >
      <NavIcon icon={item.icon} />
      {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
    </NavLink>
  ) : (
    <button
      type="button"
      onClick={() => { if (hasChildren) setExpanded(!expanded); }}
      className={cn('sidebar-item w-full', isActive && 'active')}
      data-active={isActive}
      aria-expanded={hasChildren ? expanded : undefined}
    >
      <NavIcon icon={item.icon} />
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{item.label}</span>
          {hasChildren && (
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          )}
        </>
      )}
    </button>
  );

  const wrapped = collapsed ? (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          className="z-50 rounded-lg bg-secondary-800 px-3 py-1.5 text-sm text-white shadow-lg"
        >
          {item.label}
          <Tooltip.Arrow className="fill-secondary-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  ) : (
    content
  );

  return (
    <div>
      {wrapped}
      {hasChildren && expanded && !collapsed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {childrenArr.map((child) => {
            if (!child.roles.includes(user.role)) return null;
            return (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onNavigate}
                className={({ isActive: childActive }) =>
                  cn('sidebar-item ml-2 pl-8', childActive && 'active')
                }
              >
                <NavIcon icon={child.icon} />
                <span>{child.label}</span>
              </NavLink>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, recentlyViewed } = useAppStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center w-full')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <Truck className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-sm font-semibold text-white truncate">
              {appConfig.name}
            </span>
          )}
        </div>
      </div>

      {/* Recently visited */}
      {!sidebarCollapsed && (
        <div className="border-b border-border/50 px-3 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-secondary-500">
            <History className="h-3 w-3" />
            <span>Recent</span>
          </div>
          <div className="mt-1 flex flex-col gap-0.5">
            {recentlyViewed.length > 0 ? (
              recentlyViewed.slice(0, 5).map((page) => (
                <NavLink
                  key={page.path}
                  to={page.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1 rounded px-1 py-0.5 text-xs transition-colors',
                      isActive
                        ? 'text-accent-400'
                        : 'text-secondary-400 hover:text-secondary-200'
                    )
                  }
                >
                  <Star className="h-3 w-3 shrink-0 text-amber-500/70" />
                  <span className="truncate">{page.label}</span>
                </NavLink>
              ))
            ) : (
              <div className="flex items-center gap-1 text-xs text-secondary-500">
                <Star className="h-3 w-3 text-amber-500/30" />
                <span className="truncate">No recent pages</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <nav className="flex flex-col gap-4">
          {sections.map((section) => (
            <div key={section.label || 'root'}>
              {section.label && !sidebarCollapsed && (
                <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary-500">
                  {section.label}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {navigation
                  .filter((item) => section.keys.includes(item.label))
                  .map((item) => (
                    <SidebarNavItem key={item.label} item={item} collapsed={sidebarCollapsed} />
                  ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-border p-3">
        {sidebarCollapsed ? (
          <Tooltip.Root delayDuration={300}>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={toggleSidebar}
                className="flex w-full items-center justify-center rounded-lg p-2 text-secondary-400 transition-colors hover:bg-surface-light hover:text-white"
                aria-label="Expand sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                className="z-50 rounded-lg bg-secondary-800 px-3 py-1.5 text-sm text-white shadow-lg"
              >
                Expand sidebar
                <Tooltip.Arrow className="fill-secondary-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-400">
              {getInitials('User')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">User</p>
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-secondary-400 transition-colors hover:bg-surface-light hover:text-white"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
