import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarCheck,
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
  Search,
} from 'lucide-react';
import { navigation, type NavItem } from '@/config/navigation';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  CalendarCheck,
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
};

interface SearchItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  parent?: string;
}

function flattenNavigation(items: NavItem[]): SearchItem[] {
  const result: SearchItem[] = [];
  for (const item of items) {
    if (item.path) {
      result.push({ id: item.path, label: item.label, path: item.path, icon: item.icon });
    }
    if (item.children) {
      for (const child of item.children) {
        result.push({
          id: child.path,
          label: child.label,
          path: child.path,
          icon: child.icon,
          parent: item.label,
        });
      }
    }
  }
  return result;
}

const searchItems = flattenNavigation(navigation);

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setSearch('');
  };

  const filteredItems = search
    ? searchItems.filter(
        (item) =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          (item.parent && item.parent.toLowerCase().includes(search.toLowerCase()))
      )
    : searchItems;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              onOpenChange(false);
              setSearch('');
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <Command
              className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
              label="Command palette"
            >
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-5 w-5 text-secondary-400" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search pages..."
                  className="flex-1 bg-transparent py-4 text-sm text-white placeholder-secondary-400 outline-none"
                />
              </div>

              <Command.List className="max-h-72 overflow-y-auto p-2 scrollbar-thin">
                <Command.Empty className="py-6 text-center text-sm text-secondary-400">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Pages" className="text-xs font-medium text-secondary-400 px-2 py-1.5">
                  {filteredItems.map((item) => {
                    const Icon = iconMap[item.icon];
                    return (
                      <Command.Item
                        key={item.id}
                        value={item.label}
                        onSelect={() => handleSelect(item.path)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-secondary-200 transition-colors aria-selected:bg-surface-light aria-selected:text-white"
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                        {item.parent && (
                          <span className="ml-auto text-xs text-secondary-500">{item.parent}</span>
                        )}
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              </Command.List>

              <div className="flex items-center gap-4 border-t border-border px-4 py-2.5">
                <div className="flex items-center gap-1.5 text-xs text-secondary-500">
                  <kbd className="rounded border border-border bg-surface-lighter px-1.5 py-0.5 text-[10px]">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-secondary-500">
                  <kbd className="rounded border border-border bg-surface-lighter px-1.5 py-0.5 text-[10px]">↵</kbd>
                  <span>Open</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-secondary-500">
                  <kbd className="rounded border border-border bg-surface-lighter px-1.5 py-0.5 text-[10px]">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
