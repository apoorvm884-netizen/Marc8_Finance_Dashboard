import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  ChevronDown,
  X,
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
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useAuth } from '@/hooks/use-auth';
import { cn, getInitials } from '@/lib/utils';
import { appConfig } from '@/config';
import { navigation, type NavItem } from '@/config/navigation';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

function NavIcon({ icon }: { icon: string }) {
  const Icon = iconMap[icon];
  if (!Icon) return null;
  return <Icon className="h-5 w-5 shrink-0" />;
}

function MobileNavItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
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

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          } else if (item.path) {
            onClose();
          }
        }}
        className={cn('sidebar-item w-full', isActive && 'active')}
        data-active={isActive}
      >
        <NavIcon icon={item.icon} />
        <span className="flex-1 text-left">{item.label}</span>
        {hasChildren && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        )}
      </button>
      {hasChildren && expanded && (
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {childrenArr.map((child) => {
              if (!child.roles.includes(user.role)) return null;
              const isChildActive = location.pathname === child.path;
              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={onClose}
                  className={cn('sidebar-item ml-2 pl-8', isChildActive && 'active')}
                  data-active={isChildActive}
                >
                  <NavIcon icon={child.icon} />
                  <span>{child.label}</span>
                </NavLink>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useAppStore();
  const { user } = useAuth();

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-border bg-surface"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                  <Truck className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">{appConfig.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-lg p-2 text-secondary-400 transition-colors hover:bg-surface-light hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
              <nav className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <MobileNavItem
                    key={item.label}
                    item={item}
                    onClose={() => setMobileSidebarOpen(false)}
                  />
                ))}
              </nav>
            </div>

            {user && (
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-400">
                    {getInitials(`${user.first_name ?? ''} ${user.last_name ?? ''}`)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}</p>
                    <p className="truncate text-xs text-secondary-400">{user.role}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
