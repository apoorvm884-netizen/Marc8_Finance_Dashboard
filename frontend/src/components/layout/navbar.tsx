import { useAppStore } from '@/stores/app-store';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-media-query';
import { UserMenu } from './user-menu';
import { CommandPalette } from './command-palette';
import { NotificationBell } from './notification-bell';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { Menu, Search, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { toggleSidebar, setMobileSidebarOpen } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur-xl sm:px-6">
        <button
          type="button"
          onClick={isMobile ? () => setMobileSidebarOpen(true) : toggleSidebar}
          className="rounded-lg p-2 text-secondary-400 transition-colors hover:bg-surface-light hover:text-white"
          aria-label={isMobile ? 'Open mobile menu' : 'Toggle sidebar'}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex flex-1 flex-col">
          <Breadcrumb />
        </div>

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className={cn(
            'hidden sm:flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-secondary-400 transition-colors',
            'hover:border-border-light hover:text-secondary-300',
            'max-w-md'
          )}
        >
          <Search className="h-4 w-4" />
          <span>Search anything...</span>
          <kbd className="ml-auto hidden rounded border border-border bg-surface px-1.5 py-0.5 text-xs text-secondary-500 md:inline-block">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="sm:hidden rounded-lg p-2 text-secondary-400 transition-colors hover:bg-surface-light hover:text-white"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <NotificationBell />

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-secondary-400 transition-colors hover:bg-surface-light hover:text-white"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <UserMenu />
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
