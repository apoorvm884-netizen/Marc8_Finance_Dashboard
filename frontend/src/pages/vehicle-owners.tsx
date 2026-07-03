import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { useDebounce } from '@/hooks/use-debounce';
import { vehicleOwnerService } from '@/services/vehicle-owner.service';
import { useMasterValues } from '@/hooks/use-master-values';
import type { VehicleOwner } from '@/types/vehicle-owner';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { VehicleOwnerForm } from '@/components/vehicle-owners/vehicle-owner-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Undo2,
  Users,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

export default function VehicleOwnersPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { getSelectOptions: getOwnerTypeOptions } = useMasterValues('ownership_type');
  const { getSelectOptions: getOwnerStatusOptions } = useMasterValues('owner_status');

  const ownerTypeFilterOptions: { label: string; value: string }[] = [
    { label: 'All Types', value: '' },
    ...getOwnerTypeOptions(),
  ];

  const ownerStatusFilterOptions: { label: string; value: string }[] = [
    { label: 'All Statuses', value: '' },
    ...getOwnerStatusOptions(),
  ];

  const [owners, setOwners] = useState<VehicleOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState(searchParams.get('owner_type') || '');
  const [ownerStatusFilter, setOwnerStatusFilter] = useState(searchParams.get('ownership_status') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(Number(searchParams.get('limit')) || 10);
  const [sortBy] = useState(searchParams.get('sort_by') || 'created_at');
  const [sortOrder] = useState<'asc' | 'desc'>((searchParams.get('sort_order') as 'asc' | 'desc') || 'desc');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<VehicleOwner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<VehicleOwner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const canCreate = isAdmin || isManager;
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin || isManager;

  const fetchOwners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await vehicleOwnerService.findAll({
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: debouncedSearch || undefined,
        owner_type: (ownerTypeFilter as any) || undefined,
        ownership_status: (ownerStatusFilter as any) || undefined,
      });
      setOwners(result.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load vehicle owners';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, ownerTypeFilter, ownerStatusFilter, debouncedSearch, notify]);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (ownerTypeFilter) params.set('owner_type', ownerTypeFilter);
    if (ownerStatusFilter) params.set('ownership_status', ownerStatusFilter);
    if (page > 1) params.set('page', String(page));
    if (limit !== 10) params.set('limit', String(limit));
    if (sortBy !== 'created_at') params.set('sort_by', sortBy);
    if (sortOrder !== 'desc') params.set('sort_order', sortOrder);
    setSearchParams(params, { replace: true });
  }, [search, ownerTypeFilter, ownerStatusFilter, page, limit, sortBy, sortOrder, setSearchParams]);

  const handleCreate = () => {
    setEditingOwner(null);
    setDrawerOpen(true);
  };

  const handleEdit = (owner: VehicleOwner) => {
    setEditingOwner(owner);
    setDrawerOpen(true);
  };

  const handleFormSuccess = () => {
    fetchOwners();
  };

  const handleDeleteClick = (owner: VehicleOwner) => {
    setOwnerToDelete(owner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ownerToDelete) return;
    setIsDeleting(true);
    try {
      await vehicleOwnerService.delete(ownerToDelete.id);
      notify.success(`Owner "${ownerToDelete.name}" deleted`);
      setDeleteDialogOpen(false);
      setOwnerToDelete(null);
      fetchOwners();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete owner';
      notify.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (owner: VehicleOwner) => {
    try {
      await vehicleOwnerService.restore(owner.id);
      notify.success(`Owner "${owner.name}" restored`);
      fetchOwners();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore owner';
      notify.error(message);
    }
  };

  const columns: ColumnDef<VehicleOwner>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <button
            onClick={() => navigate(`/vehicle-owners/${row.original.id}`)}
            className="font-medium text-accent-500 hover:text-accent-400 hover:underline text-left"
          >
            {row.original.name}
          </button>
          {row.original.phone && (
            <p className="text-xs text-secondary-500">{row.original.phone}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'owner_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.owner_type;
        const labels: Record<string, string> = {
          company_owned: 'Company',
          client_owned: 'Client',
          partner_owned: 'Partner',
          investor_owned: 'Investor',
        };
        const colors: Record<string, string> = {
          company_owned: 'bg-blue-500/10 text-blue-400',
          client_owned: 'bg-emerald-500/10 text-emerald-400',
          partner_owned: 'bg-purple-500/10 text-purple-400',
          investor_owned: 'bg-orange-500/10 text-orange-400',
        };
        return (
          <Badge variant="outline" className={`${colors[type] || ''} text-xs`}>
            {labels[type] || type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => {
        const city = row.original.city;
        if (!city) return <span className="text-secondary-500">-</span>;
        return <span className="text-secondary-300">{city}</span>;
      },
    },
    {
      accessorKey: 'agreement_number',
      header: 'Agreement',
      cell: ({ row }) => {
        const num = row.original.agreement_number;
        if (!num) return <span className="text-secondary-500">-</span>;
        return <span className="text-xs text-secondary-300">{num}</span>;
      },
    },
    {
      accessorKey: 'ownership_status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.ownership_status;
        const variants: Record<string, 'success' | 'warning' | 'secondary'> = {
          active: 'success',
          suspended: 'warning',
          inactive: 'secondary',
        };
        return (
          <Badge variant={variants[status] || 'secondary'} dot>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
          </Badge>
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
            <DropdownMenuItem onClick={() => navigate(`/vehicle-owners/${row.original.id}`)}>
              <Pencil className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
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
        title="Vehicle Owners"
        description="Manage owners of co-hosted fleet vehicles"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={fetchOwners}
              loading={loading}
            >
              Refresh
            </Button>
            {canCreate && (
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                Add Owner
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
              placeholder="Search owners..."
            />
          </div>
          <div className="w-44">
            <Select value={ownerTypeFilter} onValueChange={(v) => { setOwnerTypeFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {ownerTypeFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <Select value={ownerStatusFilter} onValueChange={(v) => { setOwnerStatusFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {ownerStatusFilterOptions.map((opt) => (
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
          data={owners}
          loading={loading}
          error={error}
          onRetry={fetchOwners}
          enableSelection={canDelete}
          enableColumnVisibility
          enableExport
          emptyMessage="No vehicle owners found"
          emptyIcon={<Users className="h-8 w-8 text-secondary-500" />}
          pageSize={limit}
          searchable={false}
        />
      </motion.div>

      <VehicleOwnerForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        owner={editingOwner}
        onSuccess={handleFormSuccess}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Vehicle Owner"
        description={
          ownerToDelete
            ? `Are you sure you want to delete "${ownerToDelete.name}"? This action can be undone by restoring the owner.`
            : 'Are you sure you want to delete this owner?'
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
