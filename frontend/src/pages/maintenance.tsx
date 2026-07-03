import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { useDebounce } from '@/hooks/use-debounce';
import { maintenanceService } from '@/services/maintenance.service';
import { vehicleService } from '@/services/vehicle.service';
import { vendorService } from '@/services/vendor.service';
import { useMasterValues } from '@/hooks/use-master-values';
import type { MaintenanceRecord } from '@/types/maintenance';
import type { Vehicle } from '@/types/vehicle';
import type { Vendor } from '@/types/vendor';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { MaintenanceForm } from '@/components/maintenance/maintenance-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Undo2,
  Wrench,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

const defaultStatusOptions: { label: string; value: string }[] = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function MaintenancePage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const { getSelectOptions: getDynamicStatusOptions } = useMasterValues('maintenance_type');

  const statusOptions: { label: string; value: string }[] = [
    { label: 'All Status', value: '' },
    ...(getDynamicStatusOptions().length > 0 ? getDynamicStatusOptions() : defaultStatusOptions),
  ];

  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [vehicleFilter, setVehicleFilter] = useState(searchParams.get('vehicle_id') || '');
  const [vendorFilter, setVendorFilter] = useState(searchParams.get('vendor_id') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('maintenance_type_id') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(Number(searchParams.get('limit')) || 10);
  const [sortBy] = useState(searchParams.get('sort_by') || 'created_at');
  const [sortOrder] = useState<'asc' | 'desc'>((searchParams.get('sort_order') as 'asc' | 'desc') || 'desc');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const canCreate = isAdmin || isManager;
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin || isManager;

  const fetchOptions = useCallback(async () => {
    try {
      const [vehiclesData, vendorsData] = await Promise.all([
        vehicleService.findAll({ limit: 200, is_active: 'true' }),
        vendorService.findAll({ limit: 200 }),
      ]);
      setVehicles((vehiclesData.data ?? []).filter((v: Vehicle) => v.is_active && !v.deleted_at));
      setVendors(vendorsData.data ?? []);
    } catch {
      // Silently fail for filter options
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await maintenanceService.findAll({
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        vehicle_id: vehicleFilter || undefined,
        vendor_id: vendorFilter || undefined,
        maintenance_type_id: typeFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setRecords(result.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load maintenance records';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, statusFilter, vehicleFilter, vendorFilter, typeFilter, dateFrom, dateTo, debouncedSearch, notify]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (vehicleFilter) params.set('vehicle_id', vehicleFilter);
    if (vendorFilter) params.set('vendor_id', vendorFilter);
    if (typeFilter) params.set('maintenance_type_id', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (page > 1) params.set('page', String(page));
    if (limit !== 10) params.set('limit', String(limit));
    if (sortBy !== 'created_at') params.set('sort_by', sortBy);
    if (sortOrder !== 'desc') params.set('sort_order', sortOrder);
    setSearchParams(params, { replace: true });
  }, [search, vehicleFilter, vendorFilter, typeFilter, statusFilter, dateFrom, dateTo, page, limit, sortBy, sortOrder, setSearchParams]);

  const handleCreate = () => {
    setEditingRecord(null);
    setDrawerOpen(true);
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setDrawerOpen(true);
  };

  const handleFormSuccess = () => {
    fetchRecords();
  };

  const handleDeleteClick = (record: MaintenanceRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await maintenanceService.delete(recordToDelete.id);
      notify.success('Maintenance record deleted');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      fetchRecords();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete record';
      notify.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (record: MaintenanceRecord) => {
    try {
      await maintenanceService.restore(record.id);
      notify.success('Maintenance record restored');
      fetchRecords();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore record';
      notify.error(message);
    }
  };

  const statusBadgeVariant: Record<string, 'success' | 'warning' | 'info' | 'secondary'> = {
    completed: 'success',
    in_progress: 'info',
    scheduled: 'warning',
    cancelled: 'secondary',
  };

  const columns: ColumnDef<MaintenanceRecord>[] = [
    {
      accessorKey: 'vehicle_number',
      header: 'Vehicle No.',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-white">{row.original.vehicle_number}</span>
          {row.original.vehicle_name && (
            <p className="text-xs text-secondary-500">{row.original.vehicle_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'maintenance_type_name',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.maintenance_type_name;
        return type ? (
          <Badge
            variant="outline"
            className="text-xs"
            style={row.original.maintenance_type_color ? { borderColor: row.original.maintenance_type_color, color: row.original.maintenance_type_color } : undefined}
          >
            {type}
          </Badge>
        ) : (
          <span className="text-secondary-500">-</span>
        );
      },
    },
    {
      accessorKey: 'service_date',
      header: 'Service Date',
      cell: ({ row }) => {
        const date = row.original.service_date;
        return date ? (
          <span className="text-secondary-300">{formatDate(date)}</span>
        ) : (
          <span className="text-secondary-500">-</span>
        );
      },
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ row }) => (
        <span className="text-secondary-300">
          {formatCurrency(row.original.cost)}
        </span>
      ),
    },
    {
      accessorKey: 'vendor_name',
      header: 'Vendor',
      cell: ({ row }) => (
        <span className="text-secondary-300">
          {row.original.vendor_name || <span className="text-secondary-500">-</span>}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant[row.original.status] ?? 'default'} dot>
          {row.original.status === 'in_progress'
            ? 'In Progress'
            : row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: 'odometer_reading',
      header: 'Odometer',
      cell: ({ row }) => {
        const km = row.original.odometer_reading;
        return km != null ? (
          <span className="text-secondary-300">{km.toLocaleString()} km</span>
        ) : (
          <span className="text-secondary-500">-</span>
        );
      },
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
            {row.original.deleted_at ? (
              <DropdownMenuItem onClick={() => handleRestore(row.original)} disabled={!canDelete}>
                <Undo2 className="mr-2 h-4 w-4" />
                Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => handleDeleteClick(row.original)}
                disabled={!canDelete}
                className="text-red-400 focus:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Maintenance"
        description="Track and manage vehicle maintenance records"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={fetchRecords}
              loading={loading}
            >
              Refresh
            </Button>
            {canCreate && (
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                Add Record
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
              placeholder="Search maintenance..."
            />
          </div>
          <div className="w-44">
            <Select value={vehicleFilter} onValueChange={(v) => { setVehicleFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Vehicles</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.vehicle_number} - {v.vehicle_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <Select value={vendorFilter} onValueChange={(v) => { setVendorFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Vendors</SelectItem>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {getDynamicStatusOptions().map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              title="Date from"
            />
          </div>
          <div className="w-36">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              title="Date to"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={records}
          loading={loading}
          error={error}
          onRetry={fetchRecords}
          enableSelection={canDelete}
          enableColumnVisibility
          enableExport
          emptyMessage="No maintenance records found"
          emptyIcon={<Wrench className="h-8 w-8 text-secondary-500" />}
          pageSize={limit}
          searchable={false}
        />
      </motion.div>

      <MaintenanceForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        record={editingRecord}
        onSuccess={handleFormSuccess}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Maintenance Record"
        description={
          recordToDelete
            ? `Are you sure you want to delete this maintenance record? This action can be undone by restoring.`
            : 'Are you sure you want to delete this record?'
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
