import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, AlertTriangle, XCircle, CheckCircle2, Info } from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState<{ id: string; title: string; type: string; created_at: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const result = await notificationService.getUnreadCount();
      setUnreadCount(result.count);
    } catch {
      // silent
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationService.findAll({ limit: 5, is_read: 'false' });
      const items = (result.data ?? []).map((n) => ({
        id: n.id,
        title: n.title,
        type: n.type,
        created_at: n.created_at,
      }));
      setRecent(items);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    if (open) fetchRecent();
  }, [open, fetchRecent]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setRecent([]);
    } catch {
      // silent
    }
  };

  const typeColors: Record<string, string> = {
    warning: 'text-amber-400',
    error: 'text-red-400',
    success: 'text-emerald-400',
    info: 'text-blue-400',
    system: 'text-secondary-400',
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-secondary-400 transition-colors hover:bg-surface-light hover:text-white"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-secondary-400 hover:text-white transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 px-4 py-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-lighter" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-secondary-500">No unread notifications</p>
              </div>
            ) : (
              recent.map((n) => (
                <div key={n.id} className="flex items-start gap-3 border-b border-border/50 px-4 py-3 hover:bg-surface-light/50 transition-colors">
                  <div className={cn('mt-0.5', typeColors[n.type] || 'text-secondary-400')}>
                    {n.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-400" />
                      : n.type === 'error' ? <XCircle className="h-4 w-4 text-red-400" />
                      : n.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      : <Info className="h-4 w-4 text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{n.title}</p>
                    <p className="text-[10px] text-secondary-500">{formatDate(n.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/notifications'); }}
            className="flex w-full items-center justify-center gap-2 rounded-b-xl border-t border-border px-4 py-3 text-xs text-secondary-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
}
