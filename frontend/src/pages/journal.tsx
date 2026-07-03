import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { useDebounce } from '@/hooks/use-debounce';
import { journalService } from '@/services/journal.service';
import { vehicleService } from '@/services/vehicle.service';
import { masterService } from '@/services/master.service';
import type { JournalEntry } from '@/types/journal';
import type { Vehicle } from '@/types/vehicle';
import type { MasterValue } from '@/types/master';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { JournalForm } from '@/components/journal/journal-form';
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
  BookOpen,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

export default function JournalPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [vehicleFilter, setVehicleFilter] = useState(searchParams.get('vehicle_id') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('ledger_category_id') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(Number(searchParams.get('limit')) || 10);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<MasterValue[]>([]);

  const debouncedSearch = useDebounce(search, 400);

  const canCreate = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR] as string[]).includes(user.role);
  const canEdit = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(user.role);
  const canDelete = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(user.role);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await journalService.findAll({
        page,
        limit,
        sort_by: 'collection_date',
        sort_order: 'desc',
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        vehicle_id: vehicleFilter || undefined,
        ledger_category_id: categoryFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setEntries(result.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load journal entries';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, vehicleFilter, categoryFilter, dateFrom, dateTo, debouncedSearch, notify]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (vehicleFilter) params.set('vehicle_id', vehicleFilter);
    if (categoryFilter) params.set('ledger_category_id', categoryFilter);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (page > 1) params.set('page', String(page));
    if (limit !== 10) params.set('limit', String(limit));
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, vehicleFilter, categoryFilter, dateFrom, dateTo, page, limit, setSearchParams]);

  useEffect(() => {
    Promise.all([
      vehicleService.findAll({ limit: 200, is_active: 'true' }),
      masterService.getValues('journal_category', { limit: 100, sort_by: 'display_order', sort_order: 'asc' }),
    ]).then(([vData, cData]) => {
      setVehicles((vData.data ?? []).filter((v: Vehicle) => v.is_active && !v.deleted_at));
      setCategories((cData.data ?? []).filter((c: MasterValue) => c.is_active && !c.deleted_at));
    }).catch(() => {});
  }, []);

  const handleCreate = () => {
    setEditingEntry(null);
    setDrawerOpen(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (entry: JournalEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await journalService.delete(entryToDelete.id);
      notify.success('Journal entry deleted');
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      fetchEntries();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (entry: JournalEntry) => {
    try {
      await journalService.restore(entry.id);
      notify.success('Journal entry restored');
      fetchEntries();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to restore');
    }
  };

  const handleDuplicate = async (entry: JournalEntry) => {
    try {
      await journalService.duplicate(entry.id);
      notify.success('Journal entry duplicated');
      fetchEntries();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to duplicate');
    }
  };

  const columns: ColumnDef<JournalEntry>[] = [
    {
      accessorKey: 'vehicle_number',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <span className="text-white">{row.original.vehicle_number || '-'}</span>
          {row.original.vehicle_name && (
            <p className="text-xs text-secondary-400">{row.original.vehicle_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'collection_date',
      header: 'Collection Date',
      cell: ({ row }) => (
        <span className="text-secondary-300">{formatDate(row.original.collection_date)}</span>
      ),
    },
    {
      accessorKey: 'amount_collected',
      header: 'Amount Collected',
      cell: ({ row }) => (
        <span className="text-white">₹{row.original.amount_collected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Amount',
      cell: ({ row }) => (
        <span className="text-white">₹{row.original.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      accessorKey: 'category_name',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-secondary-300">{row.original.category_name || '-'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusColors[row.original.status] ?? 'default'} dot>
          {row.original.status.charAt(0) + row.original.status.slice(1).toLowerCase()}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 80,
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
                className="text-red-400"
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
        title="Journal Ledger"
        description="Manage journal entries and collections"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={fetchEntries}
              loading={loading}
            >
              Refresh
            </Button>
            {canCreate && (
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                New Entry
              </Button>
            )}
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search by vehicle..."
            />
          </div>
          <div className="w-40">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
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
          <div className="w-48">
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-40"
            placeholder="From date"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-40"
            placeholder="To date"
          />
        </div>

        <DataTable
          columns={columns}
          data={entries}
          loading={loading}
          error={error}
          onRetry={fetchEntries}
          enableSelection={canDelete}
          enableColumnVisibility
          enableExport
          emptyMessage="No journal entries found"
          emptyIcon={<BookOpen className="h-8 w-8 text-secondary-500" />}
          pageSize={limit}
          searchable={false}
        />

      </motion.div>

      <JournalForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        entry={editingEntry}
        onSuccess={fetchEntries}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Journal Entry"
        description={
          entryToDelete
            ? `Are you sure you want to delete this journal entry? This can be undone by restoring.`
            : 'Are you sure?'
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
