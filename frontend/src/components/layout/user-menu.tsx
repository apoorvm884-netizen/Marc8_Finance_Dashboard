import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Avatar from '@radix-ui/react-avatar';
import { useAuth } from '@/hooks/use-auth';
import { getInitials } from '@/lib/utils';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-surface-light"
        >
          <Avatar.Root className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-400">
            <Avatar.Fallback>{getInitials(`${user.first_name ?? ''} ${user.last_name ?? ''}`)}</Avatar.Fallback>
          </Avatar.Root>
          <ChevronDown className="h-4 w-4 text-secondary-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[14rem] overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-sm font-medium text-white">{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}</p>
            <p className="text-xs text-secondary-400">{user.email}</p>
          </div>

          <DropdownMenu.Item
            onClick={() => navigate('/profile')}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-secondary-300 outline-none transition-colors hover:bg-surface-light hover:text-white"
          >
            <User className="h-4 w-4" />
            Profile
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => navigate('/settings')}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-secondary-300 outline-none transition-colors hover:bg-surface-light hover:text-white"
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 border-t border-border" />

          <DropdownMenu.Item
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 outline-none transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
