import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { useDebounce } from '@/hooks/use-debounce';
import { outstandingService } from '@/services/outstanding.service';
import { vehicleService } from '@/services/vehicle.service';
import { masterService } from '@/services/master.service';
import type { Outstanding } from '@/types/outstanding';
import type { Vehicle } from '@/types/vehicle';
import type { MasterValue } from '@/types/master';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { OutstandingForm } from '@/components/outstanding/outstanding-form';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import {
  Plus, RefreshCw, MoreHorizontal, Pencil, Trash2, Undo2,
  IndianRupee, CheckCircle2, Calendar,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

const statusConfig: Record<string, { color: 'warning' | 'destructive' | 'success' | 'secondary' | 'default' | 'info'; label: string }> = {
  upcoming: { color: 'info', label: 'Upcoming' },
  due_today: { color: 'warning', label: 'Due Today' },
  overdue: { color: 'destructive', label: 'Overdue' },
  paid: { color: 'success', label: 'Paid' },
  cancelled: { color: 'secondary', label: 'Cancelled' },
  partially_paid: { color: 'warning', label: 'Partially Paid' },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: 'text-green-400', label: 'Low' },
  normal: { color: 'text-blue-400', label: 'Normal' },
  high: { color: 'text-orange-400', label: 'High' },
  urgent: { color: 'text-red-400', label: 'Urgent' },
};

export default function OutstandingPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<Outstanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('outstanding_category_id') || '');
  const [vehicleFilter, setVehicleFilter] = useState(searchParams.get('vehicle_id') || '');
  const [dueDateFrom, setDueDateFrom] = useState(searchParams.get('due_date_from') || '');
  const [dueDateTo, setDueDateTo] = useState(searchParams.get('due_date_to') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(Number(searchParams.get('limit')) || 10);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Outstanding | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Outstanding | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [itemToPay, setItemToPay] = useState<Outstanding | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payModeId, setPayModeId] = useState('');
  const [payExpCatId, setPayExpCatId] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<MasterValue[]>([]);
  const [paymentModes, setPaymentModes] = useState<MasterValue[]>([]);

  const debouncedSearch = useDebounce(search, 400);

  const canCreate = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR] as string[]).includes(user.role);
  const canEdit = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(user.role);
  const canDelete = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(user.role);
  const canMarkPaid = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(user.role);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await outstandingService.findAll({
        page, limit,
        sort_by: 'due_date',
        sort_order: 'asc',
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: debouncedSearch || undefined,
        vehicle_id: vehicleFilter || undefined,
        outstanding_category_id: categoryFilter || undefined,
        due_date_from: dueDateFrom || undefined,
        due_date_to: dueDateTo || undefined,
      });
      setItems(result.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, priorityFilter, vehicleFilter, categoryFilter, dueDateFrom, dueDateTo, debouncedSearch, notify]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (priorityFilter) params.set('priority', priorityFilter);
    if (categoryFilter) params.set('outstanding_category_id', categoryFilter);
    if (vehicleFilter) params.set('vehicle_id', vehicleFilter);
    if (dueDateFrom) params.set('due_date_from', dueDateFrom);
    if (dueDateTo) params.set('due_date_to', dueDateTo);
    if (page > 1) params.set('page', String(page));
    if (limit !== 10) params.set('limit', String(limit));
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, priorityFilter, categoryFilter, vehicleFilter, dueDateFrom, dueDateTo, page, limit, setSearchParams]);

  useEffect(() => {
    Promise.all([
      vehicleService.findAll({ limit: 200, is_active: 'true' }),
      masterService.getValues('outstanding_category', { limit: 100, sort_by: 'display_order', sort_order: 'asc' }),
      masterService.getValues('payment_mode', { limit: 100, sort_by: 'display_order', sort_order: 'asc' }),
    ]).then(([vData, cData, mData]) => {
      setVehicles((vData.data ?? []).filter((v: Vehicle) => v.is_active && !v.deleted_at));
      setCategories((cData.data ?? []).filter((c: MasterValue) => c.is_active && !c.deleted_at));
      setPaymentModes((mData.data ?? []).filter((m: MasterValue) => m.is_active && !m.deleted_at));
    }).catch(() => {});
  }, []);

  const handleCreate = () => { setEditingItem(null); setDrawerOpen(true); };
  const handleEdit = (item: Outstanding) => { setEditingItem(item); setDrawerOpen(true); };

  const handleDeleteClick = (item: Outstanding) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await outstandingService.delete(itemToDelete.id);
      notify.success('Outstanding deleted');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (item: Outstanding) => {
    try {
      await outstandingService.restore(item.id);
      notify.success('Outstanding restored');
      fetchItems();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to restore');
    }
  };

  const handlePayClick = (item: Outstanding) => {
    setItemToPay(item);
    setPayAmount(String(item.amount));
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayModeId('');
    setPayExpCatId('');
    setPayNotes('');
    setPayDialogOpen(true);
  };

  const handlePayConfirm = async () => {
    if (!itemToPay) return;
    if (!payModeId) { notify.error('Select payment mode'); return; }
    if (!payExpCatId) { notify.error('Select expense category'); return; }
    setIsPaying(true);
    try {
      await outstandingService.markAsPaid(itemToPay.id, {
        payment_mode_id: payModeId,
        expense_category_id: payExpCatId,
        paid_amount: Number(payAmount),
        paid_date: payDate,
        notes: payNotes || null,
      });
      notify.success('Outstanding paid. Expense created automatically.');
      setPayDialogOpen(false);
      setItemToPay(null);
      fetchItems();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to mark as paid');
    } finally {
      setIsPaying(false);
    }
  };

  const columns: ColumnDef<Outstanding>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.original.category_color || '#64748b' }} />
          <span className="text-white font-medium">{row.original.title}</span>
        </div>
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
      accessorKey: 'vehicle_number',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <span className="text-secondary-300">{row.original.vehicle_number || '-'}</span>
          {row.original.vehicle_name && (
            <p className="text-xs text-secondary-500">{row.original.vehicle_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium text-white">
          ₹{row.original.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-secondary-500" />
          <span className="text-secondary-300">{formatDate(row.original.due_date)}</span>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <span className={`text-xs font-medium ${priorityConfig[row.original.priority]?.color || 'text-secondary-400'}`}>
          {priorityConfig[row.original.priority]?.label || row.original.priority}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status] || { color: 'default' as const, label: row.original.status };
        return (
          <Badge variant={cfg.color} dot>
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'paid_amount',
      header: 'Paid',
      cell: ({ row }) => {
        if (row.original.status === 'paid' && row.original.paid_amount != null) {
          return (
            <span className="text-green-400 text-xs">
              ₹{row.original.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          );
        }
        if (row.original.status === 'partially_paid' && row.original.paid_amount != null) {
          return (
            <span className="text-orange-400 text-xs">
              ₹{row.original.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          );
        }
        return <span className="text-secondary-500">-</span>;
      },
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
          <DropdownMenuContent align="end" className="w-44">
            {(row.original.status === 'upcoming' || row.original.status === 'due_today' || row.original.status === 'overdue' || row.original.status === 'partially_paid') && (
              <DropdownMenuItem onClick={() => handlePayClick(row.original)} disabled={!canMarkPaid}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />
                Mark as Paid
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleEdit(row.original)} disabled={!canEdit || row.original.status === 'paid'}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {row.original.deleted_at ? (
              <DropdownMenuItem onClick={() => handleRestore(row.original)} disabled={!canDelete}>
                <Undo2 className="mr-2 h-4 w-4" />
                Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleDeleteClick(row.original)} disabled={!canDelete} className="text-red-400">
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
        title="Outstanding Liabilities"
        description="Track and manage all future payments and liabilities"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={fetchItems} loading={loading}>
              Refresh
            </Button>
            {canCreate && (
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                New Outstanding
              </Button>
            )}
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search outstanding..." />
          </div>
          <div className="w-36">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="due_today">Due Today</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-32">
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <Select value={vehicleFilter} onValueChange={(v) => { setVehicleFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="All Vehicles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Vehicles</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.vehicle_number} - {v.vehicle_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input type="date" value={dueDateFrom} onChange={(e) => { setDueDateFrom(e.target.value); setPage(1); }} className="w-36" placeholder="From" />
          <Input type="date" value={dueDateTo} onChange={(e) => { setDueDateTo(e.target.value); setPage(1); }} className="w-36" placeholder="To" />
        </div>

        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          error={error}
          onRetry={fetchItems}
          enableSelection={canDelete}
          enableColumnVisibility
          enableExport
          emptyMessage="No outstanding liabilities found"
          emptyIcon={<IndianRupee className="h-8 w-8 text-secondary-500" />}
          pageSize={limit}
          searchable={false}
        />
      </motion.div>

      <OutstandingForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        outstanding={editingItem}
        onSuccess={fetchItems}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Outstanding"
        description={itemToDelete ? `Delete "${itemToDelete.title}"? This can be undone.` : 'Are you sure?'}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      {/* Mark as Paid Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
            {itemToPay && (
              <DialogDescription>
                Record payment for "{itemToPay.title}" (₹{itemToPay.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}). An expense entry will be created automatically.
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payment Amount (₹)</Label>
              <Input type="number" min="0" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Mode *</Label>
                <Select value={payModeId} onValueChange={setPayModeId}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {paymentModes.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expense Category *</Label>
                <Select value={payExpCatId} onValueChange={setPayExpCatId}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className="flex w-full rounded-lg border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 border-border resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPayDialogOpen(false)} disabled={isPaying}>
              Cancel
            </Button>
            <Button size="sm" onClick={handlePayConfirm} loading={isPaying}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
