import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { useDebounce } from '@/hooks/use-debounce';
import { vehicleService } from '@/services/vehicle.service';
import { useMasterValues } from '@/hooks/use-master-values';
import type { Vehicle, VehicleStatus, FuelType, Transmission } from '@/types/vehicle';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { VehicleForm } from '@/components/vehicles/vehicle-form';
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
  Copy,
  Trash2,
  Undo2,
  Gauge,
  AlertTriangle,
  CalendarClock,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

const defaultStatusOptions: { label: string; value: string }[] = [
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Booked', value: 'BOOKED' },
  { label: 'Maintenance', value: 'MAINTENANCE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

const defaultFuelTypeOptions: { label: string; value: string }[] = [
  { label: 'Diesel', value: 'DIESEL' },
  { label: 'Petrol', value: 'PETROL' },
  { label: 'CNG', value: 'CNG' },
  { label: 'Electric', value: 'ELECTRIC' },
];

const defaultTransmissionOptions: { label: string; value: string }[] = [
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Automatic', value: 'AUTOMATIC' },
];

function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const expiry = new Date(dateStr);
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return expiry.getTime() - now.getTime() <= thirtyDays && expiry >= now;
}

function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function getExpiryBadge(dateStr: string | null, label: string) {
  if (!dateStr) return null;
  if (isExpired(dateStr)) {
    return (
      <div className="flex items-center gap-1 text-xs text-red-400" title={`${label} expired on ${formatDate(dateStr)}`}>
        <AlertTriangle className="h-3 w-3" />
        <span>Expired</span>
      </div>
    );
  }
  if (isExpiringSoon(dateStr)) {
    return (
      <div className="flex items-center gap-1 text-xs text-amber-400" title={`${label} expiring on ${formatDate(dateStr)}`}>
        <CalendarClock className="h-3 w-3" />
        <span>Due soon</span>
      </div>
    );
  }
  return null;
}

export default function VehiclesPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const { getSelectOptions: getDynamicStatusOptions } = useMasterValues('vehicle_status');
  const { getSelectOptions: getDynamicFuelOptions } = useMasterValues('fuel_type');
  const { getSelectOptions: getDynamicTransmissionOptions } = useMasterValues('transmission_type');

  const statusOptions: { label: string; value: string }[] = [
    { label: 'All Status', value: '' },
    ...(getDynamicStatusOptions().length > 0 ? getDynamicStatusOptions() : defaultStatusOptions),
  ];

  const fuelTypeOptions: { label: string; value: string }[] = [
    { label: 'All Fuel Types', value: '' },
    ...(getDynamicFuelOptions().length > 0 ? getDynamicFuelOptions() : defaultFuelTypeOptions),
  ];

  const transmissionOptions: { label: string; value: string }[] = [
    { label: 'All Transmissions', value: '' },
    ...(getDynamicTransmissionOptions().length > 0 ? getDynamicTransmissionOptions() : defaultTransmissionOptions),
  ];

  const expiringFilterOptions = [
    { label: 'All Vehicles', value: '' },
    { label: 'Insurance Due', value: 'insurance' },
    { label: 'Fitness Due', value: 'fitness' },
    { label: 'Pollution Due', value: 'pollution' },
  ];

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [fuelTypeFilter, setFuelTypeFilter] = useState(searchParams.get('fuel_type') || '');
  const [transmissionFilter, setTransmissionFilter] = useState(searchParams.get('transmission') || '');
  const [expiringFilter, setExpiringFilter] = useState(searchParams.get('expiring') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(Number(searchParams.get('limit')) || 10);
  const [sortBy] = useState(searchParams.get('sort_by') || 'created_at');
  const [sortOrder] = useState<'asc' | 'desc'>((searchParams.get('sort_order') as 'asc' | 'desc') || 'desc');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const canCreate = isAdmin || isManager;
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin || isManager;

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const insuranceFilter = expiringFilter === 'insurance' ? 'true' : undefined;
      const fitnessFilter = expiringFilter === 'fitness' ? 'true' : undefined;
      const pollutionFilter = expiringFilter === 'pollution' ? 'true' : undefined;
      const result = await vehicleService.findAll({
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        status: (statusFilter || undefined) as VehicleStatus | undefined,
        search: debouncedSearch || undefined,
        fuel_type: (fuelTypeFilter || undefined) as FuelType | undefined,
        transmission: (transmissionFilter || undefined) as Transmission | undefined,
        insurance_expiring_soon: insuranceFilter,
        fitness_expiring_soon: fitnessFilter,
        pollution_expiring_soon: pollutionFilter,
      });
      setVehicles(result.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load vehicles';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, statusFilter, fuelTypeFilter, transmissionFilter, expiringFilter, debouncedSearch, notify]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (fuelTypeFilter) params.set('fuel_type', fuelTypeFilter);
    if (transmissionFilter) params.set('transmission', transmissionFilter);
    if (expiringFilter) params.set('expiring', expiringFilter);
    if (page > 1) params.set('page', String(page));
    if (limit !== 10) params.set('limit', String(limit));
    if (sortBy !== 'created_at') params.set('sort_by', sortBy);
    if (sortOrder !== 'desc') params.set('sort_order', sortOrder);
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, fuelTypeFilter, transmissionFilter, expiringFilter, page, limit, sortBy, sortOrder, setSearchParams]);

  const handleCreate = () => {
    setEditingVehicle(null);
    setDrawerOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setDrawerOpen(true);
  };

  const handleFormSuccess = () => {
    fetchVehicles();
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;
    setIsDeleting(true);
    try {
      await vehicleService.delete(vehicleToDelete.id);
      notify.success(`Vehicle "${vehicleToDelete.vehicle_number}" deleted`);
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
      fetchVehicles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete vehicle';
      notify.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (vehicle: Vehicle) => {
    try {
      await vehicleService.restore(vehicle.id);
      notify.success(`Vehicle "${vehicle.vehicle_number}" restored`);
      fetchVehicles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore vehicle';
      notify.error(message);
    }
  };

  const handleDuplicate = async (vehicle: Vehicle) => {
    try {
      await vehicleService.duplicate(vehicle.id);
      notify.success(`Vehicle "${vehicle.vehicle_number}" duplicated`);
      fetchVehicles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to duplicate vehicle';
      notify.error(message);
    }
  };

  const expiredCount = vehicles.filter((v) =>
    isExpired(v.insurance_expiry) || isExpired(v.fitness_expiry) || isExpired(v.pollution_expiry)
  ).length;
  const expiringCount = vehicles.filter((v) =>
    isExpiringSoon(v.insurance_expiry) || isExpiringSoon(v.fitness_expiry) || isExpiringSoon(v.pollution_expiry)
  ).length;

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: 'vehicle_number',
      header: 'Vehicle No.',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-white">{row.original.vehicle_number}</span>
          {row.original.fleet_code && (
            <p className="text-xs text-secondary-500">{row.original.fleet_code}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'vehicle_name',
      header: 'Details',
      cell: ({ row }) => (
        <div>
          <span className="text-white">{row.original.vehicle_name}</span>
          <p className="text-xs text-secondary-400">
            {[row.original.brand, row.original.model, row.original.variant].filter(Boolean).join(' / ') || '-'}
          </p>
          <p className="text-xs text-secondary-500">
            {[row.original.year, row.original.color].filter(Boolean).join(' · ') || '-'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'fuel_type',
      header: 'Fuel',
      cell: ({ row }) => {
        const fuel = row.original.fuel_type;
        if (!fuel) return <span className="text-secondary-500">-</span>;
        return (
          <Badge variant="outline" className="text-xs">
            {fuel}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'current_odometer',
      header: 'Odometer',
      cell: ({ row }) => {
        const km = row.original.current_odometer;
        return (
          <span className="text-secondary-300">
            {km != null ? `${km.toLocaleString()} km` : '-'}
          </span>
        );
      },
    },
    {
      id: 'expiry_warnings',
      header: 'Expiry',
      cell: ({ row }) => {
        const v = row.original;
        const warnings = [
          getExpiryBadge(v.insurance_expiry, 'Insurance'),
          getExpiryBadge(v.fitness_expiry, 'Fitness'),
          getExpiryBadge(v.pollution_expiry, 'Pollution'),
        ].filter(Boolean);
        if (warnings.length === 0) {
          return <span className="text-secondary-500">-</span>;
        }
        return <div className="flex flex-col gap-0.5">{warnings}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusMap: Record<string, 'success' | 'warning' | 'secondary' | 'info'> = {
          AVAILABLE: 'success',
          BOOKED: 'info',
          MAINTENANCE: 'warning',
          INACTIVE: 'secondary',
        };
        return (
          <Badge variant={statusMap[row.original.status] ?? 'default'} dot>
            {row.original.status.charAt(0) + row.original.status.slice(1).toLowerCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'purchase_date',
      header: 'Purchased',
      cell: ({ row }) => {
        const date = row.original.purchase_date;
        return date ? (
          <span className="text-secondary-300">{formatDate(date)}</span>
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
            <DropdownMenuItem onClick={() => handleDuplicate(row.original)} disabled={!canCreate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
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
        title="Fleet Master"
        description="Manage your fleet vehicles — single source of truth for every vehicle"
        actions={
          <div className="flex items-center gap-3">
            {(expiredCount > 0 || expiringCount > 0) && (
              <div className="flex items-center gap-2 text-xs">
                {expiredCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {expiredCount} expired
                  </Badge>
                )}
                {expiringCount > 0 && (
                  <Badge variant="warning" className="gap-1">
                    <CalendarClock className="h-3 w-3" />
                    {expiringCount} due soon
                  </Badge>
                )}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={fetchVehicles}
              loading={loading}
            >
              Refresh
            </Button>
            {canCreate && (
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                Add Vehicle
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
              placeholder="Search vehicles..."
            />
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
            <Select value={fuelTypeFilter} onValueChange={(v) => { setFuelTypeFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Fuel Types" />
              </SelectTrigger>
              <SelectContent>
                {fuelTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={transmissionFilter} onValueChange={(v) => { setTransmissionFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Transmissions" />
              </SelectTrigger>
              <SelectContent>
                {transmissionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={expiringFilter} onValueChange={(v) => { setExpiringFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent>
                {expiringFilterOptions.map((opt) => (
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
          data={vehicles}
          loading={loading}
          error={error}
          onRetry={fetchVehicles}
          enableSelection={canDelete}
          enableColumnVisibility
          enableExport
          emptyMessage="No vehicles found"
          emptyIcon={<Gauge className="h-8 w-8 text-secondary-500" />}
          pageSize={limit}
          searchable={false}
        />

      </motion.div>

      <VehicleForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        vehicle={editingVehicle}
        onSuccess={handleFormSuccess}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Vehicle"
        description={
          vehicleToDelete
            ? `Are you sure you want to delete "${vehicleToDelete.vehicle_number}"? This action can be undone by restoring the vehicle.`
            : 'Are you sure you want to delete this vehicle?'
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
