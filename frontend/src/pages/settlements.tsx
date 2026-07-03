import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, MoreHorizontal, Search, Eye, Pencil, Trash2, RotateCcw, Play } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { DataTable } from '@/components/shared/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { useNotification } from '@/hooks/use-notification';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { ROLES } from '@/config/constants';
import { settlementService } from '@/services/settlement.service';
import { SettlementForm } from '@/components/settlements/settlement-form';
import { PipelineRunDialog } from '@/components/settlements/pipeline-run-dialog';
import type { Settlement } from '@/types/settlement';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  calculated: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  pending_approval: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  approved: 'bg-green-500/10 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  payment_initiated: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  partially_paid: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  closed: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft', calculated: 'Calculated', pending_approval: 'Pending Approval',
  approved: 'Approved', rejected: 'Rejected', payment_initiated: 'Payment Initiated',
  paid: 'Paid', partially_paid: 'Partially Paid', cancelled: 'Cancelled', closed: 'Closed',
};

export default function SettlementsPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(10);
  const [sortBy] = useState('created_at');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settlementToDelete, setSettlementToDelete] = useState<Settlement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const canCreate = isAdmin || isManager;
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin;

  const fetchSettlements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await settlementService.findAll({
        page, limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
      setSettlements(result.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settlements');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, statusFilter, debouncedSearch]);

  useEffect(() => { fetchSettlements(); }, [fetchSettlements]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, page, setSearchParams]);

  const handleCreate = () => {
    setEditingSettlement(null);
    setDrawerOpen(true);
  };

  const handleEdit = (settlement: Settlement) => {
    setEditingSettlement(settlement);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (settlement: Settlement) => {
    setSettlementToDelete(settlement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!settlementToDelete) return;
    setIsDeleting(true);
    try {
      await settlementService.delete(settlementToDelete.id);
      notify.success('Settlement deleted successfully');
      setDeleteDialogOpen(false);
      setSettlementToDelete(null);
      fetchSettlements();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to delete settlement');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (settlement: Settlement) => {
    try {
      await settlementService.restore(settlement.id);
      notify.success('Settlement restored successfully');
      fetchSettlements();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to restore settlement');
    }
  };

  const handleFormSuccess = () => {
    fetchSettlements();
  };

  const handlePipelineSuccess = () => {
    fetchSettlements();
  };

  const columns: ColumnDef<Settlement>[] = [
    {
      accessorKey: 'settlement_number',
      header: 'Settlement #',
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/settlements/${row.original.id}`)}
          className="font-medium text-accent-500 hover:text-accent-400 hover:underline text-left"
        >
          {row.original.settlement_number}
        </button>
      ),
    },
    {
      accessorKey: 'owner_name',
      header: 'Owner',
      cell: ({ row }) => (
        <span className="text-sm text-secondary-300">{row.original.owner_name || '-'}</span>
      ),
    },
    {
      accessorKey: 'period_start',
      header: 'Period',
      cell: ({ row }) => (
        <span className="text-sm text-secondary-300">
          {row.original.period_start?.substring(0, 10)} to {row.original.period_end?.substring(0, 10)}
        </span>
      ),
    },
    {
      accessorKey: 'net_revenue',
      header: 'Net Revenue',
      cell: ({ row }) => (
        <span className="font-medium text-white">
          {'\u20b9'}{Number(row.original.net_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: 'owner_share',
      header: 'Owner Share',
      cell: ({ row }) => (
        <span className="font-medium text-emerald-400">
          {'\u20b9'}{Number(row.original.owner_share).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline" className={statusColors[row.original.status] || ''}>
          {statusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'balance_due',
      header: 'Balance',
      cell: ({ row }) => (
        <span className={`font-medium ${Number(row.original.balance_due) > 0 ? 'text-orange-400' : 'text-secondary-400'}`}>
          {'\u20b9'}{Number(row.original.balance_due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/settlements/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)} disabled={!canEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            {row.original.deleted_at ? (
              <DropdownMenuItem onClick={() => handleRestore(row.original)}>
                <RotateCcw className="mr-2 h-4 w-4" /> Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleDeleteClick(row.original)} className="text-red-400" disabled={!canDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const statusFilterOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Draft', value: 'draft' },
    { label: 'Calculated', value: 'calculated' },
    { label: 'Pending Approval', value: 'pending_approval' },
    { label: 'Approved', value: 'approved' },
    { label: 'Paid', value: 'paid' },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Settlements"
        description="Manage revenue settlements and owner payouts"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" icon={<RefreshCw />} onClick={fetchSettlements} loading={loading}>
              Refresh
            </Button>
            {canCreate && (
              <>
                <Button size="sm" icon={<Play />} onClick={() => setPipelineDialogOpen(true)}>
                  Run Pipeline
                </Button>
                <Button size="sm" icon={<Plus />} onClick={handleCreate}>
                  Create Settlement
                </Button>
              </>
            )}
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="Search settlements..." />
          </div>
          <div className="w-44">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={settlements}
          loading={loading}
          error={error}
          onRetry={fetchSettlements}
          enableSelection={canDelete}
          enableColumnVisibility
          enableExport
          emptyMessage="No settlements found"
          emptyIcon={<Search />}
          pageSize={limit}
          searchable={false}
        />
      </motion.div>

      <SettlementForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        settlement={editingSettlement}
        onSuccess={handleFormSuccess}
      />
      <PipelineRunDialog
        open={pipelineDialogOpen}
        onOpenChange={setPipelineDialogOpen}
        onSuccess={handlePipelineSuccess}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Settlement"
        description="Are you sure you want to delete this settlement? You can restore it later."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
