import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { useAppStore } from '@/stores/app-store';
import { useIsMobile } from '@/hooks/use-media-query';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { cn } from '@/lib/utils';
import { navigation, type NavItem } from '@/config/navigation';

function flattenNav(items: NavItem[]): { path: string; label: string }[] {
  const result: { path: string; label: string }[] = [];
  for (const item of items) {
    if (item.path) result.push({ path: item.path, label: item.label });
    if (item.children) {
      for (const child of item.children) {
        result.push({ path: child.path, label: `${item.label} › ${child.label}` });
      }
    }
  }
  return result;
}

const flatNav = flattenNav(navigation);

function usePageTracking() {
  const location = useLocation();
  const { addRecentlyViewed } = useAppStore();

  useEffect(() => {
    const match = flatNav.find((n) => location.pathname === n.path);
    if (match) {
      addRecentlyViewed(match.path, match.label);
    }
  }, [location.pathname, addRecentlyViewed]);
}

export function DashboardLayout() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  usePageTracking();

  useKeyboardShortcuts([
    { key: 'b', ctrl: true, handler: () => toggleSidebar(), enabled: !isMobile },
    { key: 'k', ctrl: true, handler: () => {
      const event = new CustomEvent('open-command-palette');
      window.dispatchEvent(event);
    }},
    { key: '1', ctrl: true, handler: () => navigate('/dashboard') },
    { key: '2', ctrl: true, handler: () => navigate('/bookings') },
    { key: '3', ctrl: true, handler: () => navigate('/expenses') },
    { key: '4', ctrl: true, handler: () => navigate('/fleet') },
    { key: '5', ctrl: true, handler: () => navigate('/analytics') },
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {isMobile ? (
        <MobileSidebar />
      ) : (
        <Sidebar />
      )}

      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300',
          !isMobile && (sidebarCollapsed ? 'ml-16' : 'ml-64')
        )}
      >
        <Navbar />

        <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
