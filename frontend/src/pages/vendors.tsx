import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { useDebounce } from '@/hooks/use-debounce';
import { vendorService } from '@/services/vendor.service';
import { useMasterValues } from '@/hooks/use-master-values';
import type { Vendor } from '@/types/vendor';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { VendorForm } from '@/components/vendors/vendor-form';
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
  Star,
  Building2,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

export default function VendorsPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const { getSelectOptions: getDynamicVendorTypeOptions } = useMasterValues('vendor_type');

  const vendorTypeOptions: { label: string; value: string }[] = [
    { label: 'All Types', value: '' },
    ...getDynamicVendorTypeOptions(),
  ];

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [vendorTypeFilter, setVendorTypeFilter] = useState(searchParams.get('vendor_type_id') || '');
  const [isActiveFilter, setIsActiveFilter] = useState(searchParams.get('is_active') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(Number(searchParams.get('limit')) || 10);
  const [sortBy] = useState(searchParams.get('sort_by') || 'created_at');
  const [sortOrder] = useState<'asc' | 'desc'>((searchParams.get('sort_order') as 'asc' | 'desc') || 'desc');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const canCreate = isAdmin || isManager;
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin || isManager;

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await vendorService.findAll({
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: debouncedSearch || undefined,
        vendor_type_id: vendorTypeFilter || undefined,
        is_active: isActiveFilter || undefined,
      });
      setVendors(result.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load vendors';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, vendorTypeFilter, isActiveFilter, debouncedSearch, notify]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (vendorTypeFilter) params.set('vendor_type_id', vendorTypeFilter);
    if (isActiveFilter) params.set('is_active', isActiveFilter);
    if (page > 1) params.set('page', String(page));
    if (limit !== 10) params.set('limit', String(limit));
    if (sortBy !== 'created_at') params.set('sort_by', sortBy);
    if (sortOrder !== 'desc') params.set('sort_order', sortOrder);
    setSearchParams(params, { replace: true });
  }, [search, vendorTypeFilter, isActiveFilter, page, limit, sortBy, sortOrder, setSearchParams]);

  const handleCreate = () => {
    setEditingVendor(null);
    setDrawerOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setDrawerOpen(true);
  };

  const handleFormSuccess = () => {
    fetchVendors();
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vendorToDelete) return;
    setIsDeleting(true);
    try {
      await vendorService.delete(vendorToDelete.id);
      notify.success(`Vendor "${vendorToDelete.name}" deleted`);
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
      fetchVendors();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete vendor';
      notify.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (vendor: Vendor) => {
    try {
      await vendorService.restore(vendor.id);
      notify.success(`Vendor "${vendor.name}" restored`);
      fetchVendors();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore vendor';
      notify.error(message);
    }
  };

  const activeFilterOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
  ];

  const columns: ColumnDef<Vendor>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-white">{row.original.name}</span>
          {row.original.email && (
            <p className="text-xs text-secondary-500">{row.original.email}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'contact_person',
      header: 'Contact',
      cell: ({ row }) => {
        const person = row.original.contact_person;
        const phone = row.original.phone;
        if (!person && !phone) return <span className="text-secondary-500">-</span>;
        return (
          <div>
            {person && <span className="text-white">{person}</span>}
            {phone && <p className="text-xs text-secondary-400">{phone}</p>}
          </div>
        );
      },
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => {
        const city = row.original.city;
        const state = row.original.state;
        if (!city) return <span className="text-secondary-500">-</span>;
        return (
          <span className="text-secondary-300">
            {city}{state ? `, ${state}` : ''}
          </span>
        );
      },
    },
    {
      accessorKey: 'vendor_type_name',
      header: 'Type',
      cell: ({ row }) => {
        const typeName = row.original.vendor_type_name;
        if (!typeName) return <span className="text-secondary-500">-</span>;
        return (
          <Badge variant="outline" className="text-xs">
            {typeName}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => {
        const rating = row.original.rating;
        if (rating == null) return <span className="text-secondary-500">-</span>;
        return (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3.5 w-3.5 ${
                  star <= Math.round(rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-secondary-600'
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-secondary-400">{rating.toFixed(1)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.original.is_active;
        return (
          <Badge variant={active ? 'success' : 'secondary'} dot>
            {active ? 'Active' : 'Inactive'}
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
        title="Vendors"
        description="Manage your vendors and suppliers"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={fetchVendors}
              loading={loading}
            >
              Refresh
            </Button>
            {canCreate && (
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                Add Vendor
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
              placeholder="Search vendors..."
            />
          </div>
          <div className="w-44">
            <Select value={vendorTypeFilter} onValueChange={(v) => { setVendorTypeFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {vendorTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Select value={isActiveFilter} onValueChange={(v) => { setIsActiveFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {activeFilterOptions.map((opt) => (
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
          data={vendors}
          loading={loading}
          error={error}
          onRetry={fetchVendors}
          enableSelection={canDelete}
          enableColumnVisibility
          enableExport
          emptyMessage="No vendors found"
          emptyIcon={<Building2 className="h-8 w-8 text-secondary-500" />}
          pageSize={limit}
          searchable={false}
        />
      </motion.div>

      <VendorForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        vendor={editingVendor}
        onSuccess={handleFormSuccess}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Vendor"
        description={
          vendorToDelete
            ? `Are you sure you want to delete "${vendorToDelete.name}"? This action can be undone by restoring the vendor.`
            : 'Are you sure you want to delete this vendor?'
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
