import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { useDebounce } from '@/hooks/use-debounce';
import { schedulerService } from '@/services/scheduler.service';
import type { ServiceSchedule } from '@/types/scheduler';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { ScheduleForm } from '@/components/maintenance/schedule-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarClock,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

function getDaysRemaining(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getKmProgress(nextKm: number | null, currentKm: number | null, intervalKm: number | null): number {
  if (!nextKm || !currentKm || !intervalKm || intervalKm === 0) return 0;
  const lastService = nextKm - intervalKm;
  const done = currentKm - lastService;
  return Math.min(Math.max(Math.round((done / intervalKm) * 100), 0), 100);
}

export default function ServiceSchedulesPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilterOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(Number(searchParams.get('limit')) || 10);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ServiceSchedule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ServiceSchedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const canCreate = isAdmin || isManager;
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin || isManager;

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await schedulerService.findAll({
        page,
        limit,
        status: (statusFilter || undefined) as 'active' | 'inactive' | undefined,
        search: debouncedSearch || undefined,
      } as Parameters<typeof schedulerService.findAll>[0] & { search?: string });
      setSchedules(result.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load schedules';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, debouncedSearch, notify]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (page > 1) params.set('page', String(page));
    if (limit !== 10) params.set('limit', String(limit));
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, page, limit, setSearchParams]);

  const handleCreate = () => {
    setEditingSchedule(null);
    setDrawerOpen(true);
  };

  const handleEdit = (schedule: ServiceSchedule) => {
    setEditingSchedule(schedule);
    setDrawerOpen(true);
  };

  const handleFormSuccess = () => {
    fetchSchedules();
  };

  const handleDeleteClick = (schedule: ServiceSchedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return;
    setIsDeleting(true);
    try {
      await schedulerService.delete(scheduleToDelete.id);
      notify.success('Schedule deleted');
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
      fetchSchedules();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete schedule';
      notify.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<ServiceSchedule>[] = [
    {
      accessorKey: 'vehicle_number',
      header: 'Vehicle No.',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-white">{row.original.vehicle_number || '-'}</span>
          {row.original.vehicle_name && (
            <p className="text-xs text-secondary-500">{row.original.vehicle_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'service_type',
      header: 'Service Type',
      cell: ({ row }) => {
        const typeMap: Record<string, string> = {
          time: 'Time Based',
          distance: 'Distance Based',
          both: 'Both',
        };
        return (
          <Badge variant="outline" className="text-xs">
            {typeMap[row.original.service_type] ?? row.original.service_type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'interval_km',
      header: 'Interval (km)',
      cell: ({ row }) => {
        const km = row.original.interval_km;
        return km ? (
          <Badge variant="secondary" size="sm">{km.toLocaleString()} km</Badge>
        ) : (
          <span className="text-secondary-500">-</span>
        );
      },
    },
    {
      accessorKey: 'interval_days',
      header: 'Interval (days)',
      cell: ({ row }) => {
        const days = row.original.interval_days;
        return days ? (
          <Badge variant="secondary" size="sm">{days} days</Badge>
        ) : (
          <span className="text-secondary-500">-</span>
        );
      },
    },
    {
      accessorKey: 'next_service_km',
      header: 'Next Service (km)',
      cell: ({ row }) => {
        const nextKm = row.original.next_service_km;
        const currentKm = row.original.current_odometer;
        const intervalKm = row.original.interval_km;
        if (!nextKm) return <span className="text-secondary-500">-</span>;
        const progress = getKmProgress(nextKm, currentKm, intervalKm);
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 overflow-hidden rounded-full bg-surface-lighter">
              <div
                className={`h-full rounded-full transition-all ${
                  progress >= 90 ? 'bg-red-500' : progress >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-secondary-300">{nextKm.toLocaleString()} km</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'next_service_date',
      header: 'Next Service Date',
      cell: ({ row }) => {
        const date = row.original.next_service_date;
        if (!date) return <span className="text-secondary-500">-</span>;
        const daysRemaining = getDaysRemaining(date);
        const isOverdue = daysRemaining != null && daysRemaining < 0;
        const isSoon = daysRemaining != null && daysRemaining >= 0 && daysRemaining <= 7;
        return (
          <div className="flex items-center gap-2">
            <span className="text-secondary-300">{formatDate(date)}</span>
            {daysRemaining != null && (
              <Badge
                variant={isOverdue ? 'destructive' : isSoon ? 'warning' : 'outline'}
                size="sm"
              >
                {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'success' : 'secondary'} dot>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleEdit(row.original)} disabled={!canEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteClick(row.original)}
              disabled={!canDelete}
              className="text-red-400 focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Service Schedules"
        description="Manage recurring and one-time service schedules for your fleet"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={fetchSchedules}
              loading={loading}
            >
              Refresh
            </Button>
            {canCreate && (
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                Add Schedule
              </Button>
            )}
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by vehicle..."
            />
          </div>
          <div className="w-36">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={schedules}
          loading={loading}
          error={error}
          onRetry={fetchSchedules}
          enableColumnVisibility
          enableExport
          emptyMessage="No schedules found"
          emptyIcon={<CalendarClock className="h-8 w-8 text-secondary-500" />}
          pageSize={limit}
          searchable={false}
        />
      </motion.div>

      <ScheduleForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        schedule={editingSchedule}
        onSuccess={handleFormSuccess}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Schedule"
        description={
          scheduleToDelete
            ? `Are you sure you want to delete this schedule for "${scheduleToDelete.vehicle_number || 'vehicle'}"?`
            : 'Are you sure you want to delete this schedule?'
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
