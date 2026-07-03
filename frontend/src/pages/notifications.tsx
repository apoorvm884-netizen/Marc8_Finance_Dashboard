import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '@/hooks/use-notification';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { notificationService } from '@/services/notification.service';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { formatDate } from '@/lib/utils';
import type { Notification, Reminder, NotificationPreferences } from '@/types/notification';
import { REMINDER_TYPE_LABELS } from '@/types/notification';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Bell, BellOff, CheckCheck, Trash2, RefreshCw, Calendar,
  AlertTriangle, CheckCircle, XCircle, Info, Settings,
  Eye,
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'notifications');

  const canDelete = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(user.role);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifPage, setNotifPage] = useState(1);
  const [notifSearch, setNotifSearch] = useState('');
  const [notifFilterType, setNotifFilterType] = useState('');
  const [notifFilterRead, setNotifFilterRead] = useState('');
  const debouncedNotifSearch = useDebounce(notifSearch, 400);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remLoading, setRemLoading] = useState(true);
  const [remError, setRemError] = useState<string | null>(null);
  const [remPage, setRemPage] = useState(1);
  const [remSearch, setRemSearch] = useState('');
  const [remFilterStatus, setRemFilterStatus] = useState('');
  const [remFilterType, setRemFilterType] = useState('');
  const debouncedRemSearch = useDebounce(remSearch, 400);

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [prefLoading, setPrefLoading] = useState(true);
  const [prefSaving, setPrefSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Notification | Reminder | null>(null);
  const [deleteMode, setDeleteMode] = useState<'notification' | 'reminder'>('notification');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    setNotifError(null);
    try {
      const result = await notificationService.findAll({
        page: notifPage, limit: 10, search: debouncedNotifSearch || undefined,
        type: notifFilterType || undefined, is_read: notifFilterRead || undefined,
      });
      setNotifications(result.data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load notifications';
      setNotifError(msg);
      notify.error(msg);
    } finally {
      setNotifLoading(false);
    }
  }, [notifPage, debouncedNotifSearch, notifFilterType, notifFilterRead, notify]);

  const fetchReminders = useCallback(async () => {
    setRemLoading(true);
    setRemError(null);
    try {
      const result = await notificationService.getReminders({
        page: remPage, limit: 10, search: debouncedRemSearch || undefined,
        status: remFilterStatus || undefined, reminder_type: remFilterType || undefined,
      });
      setReminders(result.data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load reminders';
      setRemError(msg);
      notify.error(msg);
    } finally {
      setRemLoading(false);
    }
  }, [remPage, debouncedRemSearch, remFilterStatus, remFilterType, notify]);

  const fetchPreferences = useCallback(async () => {
    setPrefLoading(true);
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch {
      // silent
    } finally {
      setPrefLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => { fetchReminders(); }, [fetchReminders]);
  useEffect(() => { if (activeTab === 'preferences') fetchPreferences(); }, [activeTab, fetchPreferences]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch {
      notify.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      notify.success(`Marked ${result.count} notifications as read`);
      fetchNotifications();
    } catch {
      notify.error('Failed to mark all as read');
    }
  };

  const handleDeleteClick = (item: Notification | Reminder, mode: 'notification' | 'reminder') => {
    setItemToDelete(item);
    setDeleteMode(mode);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (deleteMode === 'notification') {
        await notificationService.delete(itemToDelete.id);
        notify.success('Notification deleted');
        fetchNotifications();
      } else {
        await notificationService.deleteReminder(itemToDelete.id);
        notify.success('Reminder deleted');
        fetchReminders();
      }
    } catch {
      notify.error('Failed to delete');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    setPrefSaving(true);
    try {
      const updated = await notificationService.updatePreferences({
        in_app_enabled: preferences.in_app_enabled,
        email_enabled: preferences.email_enabled,
        reminder_days_before: preferences.reminder_days_before,
        daily_summary: preferences.daily_summary,
        weekly_summary: preferences.weekly_summary,
      });
      setPreferences(updated);
      notify.success('Preferences saved');
    } catch {
      notify.error('Failed to save preferences');
    } finally {
      setPrefSaving(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'system': return <Settings className="h-4 w-4 text-secondary-400" />;
      default: return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const notifColumns: ColumnDef<Notification>[] = [
    {
      accessorKey: 'type',
      header: '',
      cell: ({ row }) => getNotificationIcon(row.original.type),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={`text-sm ${row.original.is_read ? 'text-secondary-400' : 'text-white font-medium'}`}>
            {row.original.title}
          </span>
          {!row.original.is_read && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
        </div>
      ),
    },
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => (
        <span className="text-sm text-secondary-500 truncate max-w-xs block">
          {row.original.message || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => <span className="text-sm text-secondary-400">{formatDate(row.original.created_at)}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {!row.original.is_read && (
            <button onClick={() => handleMarkRead(row.original.id)} className="rounded p-1 text-secondary-400 hover:text-white hover:bg-surface-light transition-colors" title="Mark as read">
              <Eye className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button onClick={() => handleDeleteClick(row.original, 'notification')} className="rounded p-1 text-secondary-400 hover:text-red-400 hover:bg-surface-light transition-colors" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const remColumns: ColumnDef<Reminder>[] = [
    {
      accessorKey: 'reminder_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="info" className="text-xs">
          {REMINDER_TYPE_LABELS[row.original.reminder_type] || row.original.reminder_type}
        </Badge>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <span className="text-sm text-white">{row.original.title}</span>,
    },
    {
      accessorKey: 'vehicle_number',
      header: 'Vehicle',
      cell: ({ row }) => <span className="text-sm text-secondary-400">{row.original.vehicle_number || '-'}</span>,
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => {
        const due = new Date(row.original.due_date);
        const today = new Date();
        const isOverdue = due < today;
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-400 font-medium' : 'text-secondary-400'}`}>
            {formatDate(row.original.due_date)}
            {isOverdue && ' (Overdue)'}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const colors: Record<string, 'warning' | 'success' | 'secondary'> = {
          PENDING: 'warning',
          COMPLETED: 'success',
          DISMISSED: 'secondary',
        };
        return <Badge variant={colors[row.original.status] || 'secondary'} className="text-xs">{row.original.status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {canDelete && (
            <button onClick={() => handleDeleteClick(row.original, 'reminder')} className="rounded p-1 text-secondary-400 hover:text-red-400 hover:bg-surface-light transition-colors" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Notification & Reminder Center"
        description="Manage system notifications, configure reminders, and set preferences"
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchParams(new URLSearchParams({ tab: v }), { replace: true }); }}>
          <TabsList className="mb-6">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2">
              <Calendar className="h-4 w-4" /> Reminders
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="h-4 w-4" /> Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput value={notifSearch} onChange={(v) => { setNotifSearch(v); setNotifPage(1); }} placeholder="Search notifications..." className="w-64" />
              <Select value={notifFilterType} onValueChange={(v) => { setNotifFilterType(v); setNotifPage(1); }}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="info"><span className="flex items-center gap-2"><Info className="h-3.5 w-3.5 text-blue-400" />Info</span></SelectItem>
                  <SelectItem value="success"><span className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" />Success</span></SelectItem>
                  <SelectItem value="warning"><span className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-amber-400" />Warning</span></SelectItem>
                  <SelectItem value="error"><span className="flex items-center gap-2"><XCircle className="h-3.5 w-3.5 text-red-400" />Error</span></SelectItem>
                  <SelectItem value="system"><span className="flex items-center gap-2"><Settings className="h-3.5 w-3.5 text-secondary-400" />System</span></SelectItem>
                </SelectContent>
              </Select>
              <Select value={notifFilterRead} onValueChange={(v) => { setNotifFilterRead(v); setNotifPage(1); }}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="false"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Unread</span></SelectItem>
                  <SelectItem value="true">Read</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={fetchNotifications} loading={notifLoading}>Refresh</Button>
              <Button size="sm" variant="outline" icon={<CheckCheck className="h-4 w-4" />} onClick={handleMarkAllRead}>Mark All Read</Button>
            </div>

            <DataTable
              columns={notifColumns}
              data={notifications}
              loading={notifLoading}
              error={notifError}
              onRetry={fetchNotifications}
              emptyMessage="No notifications found"
              emptyDescription="You're all caught up! New notifications will appear here."
              emptyIcon={<BellOff className="h-8 w-8 text-secondary-500" />}
              pageSize={10}
              searchable={false}
            />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput value={remSearch} onChange={(v) => { setRemSearch(v); setRemPage(1); }} placeholder="Search reminders..." className="w-64" />
              <Select value={remFilterType} onValueChange={(v) => { setRemFilterType(v); setRemPage(1); }}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Reminder Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {Object.entries(REMINDER_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={remFilterStatus} onValueChange={(v) => { setRemFilterStatus(v); setRemPage(1); }}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="DISMISSED">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={fetchReminders} loading={remLoading}>Refresh</Button>
            </div>

            <DataTable
              columns={remColumns}
              data={reminders}
              loading={remLoading}
              error={remError}
              onRetry={fetchReminders}
              emptyMessage="No reminders found"
              emptyIcon={<Calendar className="h-8 w-8 text-secondary-500" />}
              pageSize={10}
              searchable={false}
            />
          </TabsContent>

          <TabsContent value="preferences">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-1 text-lg font-semibold text-white">Notification Preferences</h3>
              <p className="mb-6 text-sm text-secondary-400">Configure how you receive notifications</p>
              {prefLoading ? (
                <p className="text-sm text-secondary-500">Loading preferences...</p>
              ) : preferences ? (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                      <div>
                        <p className="text-sm font-medium text-white">In-App Notifications</p>
                        <p className="text-xs text-secondary-400">Receive notifications within the application</p>
                      </div>
                      <Switch checked={preferences.in_app_enabled} onCheckedChange={(v) => setPreferences({ ...preferences, in_app_enabled: v })} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                      <div>
                        <p className="text-sm font-medium text-white">Email Notifications</p>
                        <p className="text-xs text-secondary-400">Receive email notifications for important events</p>
                      </div>
                      <Switch checked={preferences.email_enabled} onCheckedChange={(v) => setPreferences({ ...preferences, email_enabled: v })} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                      <div>
                        <p className="text-sm font-medium text-white">Daily Summary</p>
                        <p className="text-xs text-secondary-400">Receive a daily summary of notifications</p>
                      </div>
                      <Switch checked={preferences.daily_summary} onCheckedChange={(v) => setPreferences({ ...preferences, daily_summary: v })} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                      <div>
                        <p className="text-sm font-medium text-white">Weekly Summary</p>
                        <p className="text-xs text-secondary-400">Receive a weekly summary of notifications</p>
                      </div>
                      <Switch checked={preferences.weekly_summary} onCheckedChange={(v) => setPreferences({ ...preferences, weekly_summary: v })} />
                    </div>
                  </div>
                  <div className="w-full sm:w-64 space-y-2">
                    <Label>Remind me before (days)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={90}
                      value={preferences.reminder_days_before}
                      onChange={(e) => setPreferences({ ...preferences, reminder_days_before: parseInt(e.target.value) || 7 })}
                    />
                    <p className="text-xs text-secondary-500">How many days before a due date to send a reminder notification</p>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Button size="sm" icon={<CheckCheck className="h-4 w-4" />} onClick={handleSavePreferences} loading={prefSaving}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${deleteMode === 'notification' ? 'Notification' : 'Reminder'}`}
        description={`Are you sure you want to delete this ${deleteMode}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
