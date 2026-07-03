import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { useDebounce } from '@/hooks/use-debounce';
import { bookingService } from '@/services/booking.service';
import type { Booking } from '@/types/booking';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { BookingForm } from '@/components/bookings/booking-form';
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
  CalendarCheck,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'secondary',
};

const paymentStatusColors: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
  PENDING: 'warning',
  PARTIALLY_PAID: 'info',
  PAID: 'success',
  REFUNDED: 'destructive',
};

export default function BookingsPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(searchParams.get('payment_status') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(Number(searchParams.get('limit')) || 10);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const canCreate = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR] as string[]).includes(user.role);
  const canEdit = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(user.role);
  const canDelete = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(user.role);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingService.findAll({
        page,
        limit,
        sort_by: 'booking_date_time',
        sort_order: 'desc',
        status: statusFilter || undefined,
        payment_status: paymentStatusFilter || undefined,
        search: debouncedSearch || undefined,
      });
      setBookings(result.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load bookings';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, paymentStatusFilter, debouncedSearch, notify]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (paymentStatusFilter) params.set('payment_status', paymentStatusFilter);
    if (page > 1) params.set('page', String(page));
    if (limit !== 10) params.set('limit', String(limit));
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, paymentStatusFilter, page, limit, setSearchParams]);

  const handleCreate = () => {
    setEditingBooking(null);
    setDrawerOpen(true);
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    setIsDeleting(true);
    try {
      await bookingService.delete(bookingToDelete.id);
      notify.success('Booking deleted');
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
      fetchBookings();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (booking: Booking) => {
    try {
      await bookingService.restore(booking.id);
      notify.success('Booking restored');
      fetchBookings();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to restore');
    }
  };

  const handleDuplicate = async (booking: Booking) => {
    try {
      await bookingService.duplicate(booking.id);
      notify.success('Booking duplicated');
      fetchBookings();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to duplicate');
    }
  };

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: 'booking_id',
      header: 'Booking ID',
      cell: ({ row }) => (
        <span className="font-medium text-white font-mono text-xs">{row.original.booking_id}</span>
      ),
    },
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
      accessorKey: 'platform_name',
      header: 'Platform',
      cell: ({ row }) => (
        <span className="text-secondary-300">{row.original.platform_name || '-'}</span>
      ),
    },
    {
      accessorKey: 'booking_date_time',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-secondary-300">{formatDate(row.original.booking_date_time)}</span>
      ),
    },
    {
      accessorKey: 'gross_fare',
      header: 'Gross Fare',
      cell: ({ row }) => (
        <span className="text-white">₹{row.original.gross_fare.toLocaleString('en-IN')}</span>
      ),
    },
    {
      accessorKey: 'discount',
      header: 'Discount',
      cell: ({ row }) => (
        <span className="text-secondary-300">₹{row.original.discount?.toLocaleString('en-IN') ?? '0'}</span>
      ),
    },
    {
      accessorKey: 'taxes',
      header: 'Taxes',
      cell: ({ row }) => (
        <span className="text-secondary-300">₹{row.original.taxes?.toLocaleString('en-IN') ?? '0'}</span>
      ),
    },
    {
      accessorKey: 'refund',
      header: 'Refund',
      cell: ({ row }) => (
        <span className="text-red-400">₹{row.original.refund?.toLocaleString('en-IN') ?? '0'}</span>
      ),
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      cell: ({ row }) => (
        <span className="text-secondary-300">{row.original.customer_name || '-'}</span>
      ),
    },
    {
      accessorKey: 'payment_status',
      header: 'Payment',
      cell: ({ row }) => (
        <Badge variant={paymentStatusColors[row.original.payment_status] ?? 'default'} dot>
          {row.original.payment_status ? row.original.payment_status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Pending'}
        </Badge>
      ),
    },
    {
      id: 'net_revenue',
      header: 'Net Revenue',
      cell: ({ row }) => (
        <span className="font-medium text-emerald-400">
          ₹{row.original.net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
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
        title="Bookings"
        description="Manage platform bookings and revenue"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={fetchBookings}
              loading={loading}
            >
              Refresh
            </Button>
            {canCreate && (
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                New Booking
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
              placeholder="Search bookings..."
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
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <Select value={paymentStatusFilter} onValueChange={(v) => { setPaymentStatusFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Payment</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={bookings}
          loading={loading}
          error={error}
          onRetry={fetchBookings}
          enableSelection={canDelete}
          enableColumnVisibility
          enableExport
          emptyMessage="No bookings found"
          emptyIcon={<CalendarCheck className="h-8 w-8 text-secondary-500" />}
          pageSize={limit}
          searchable={false}
        />

      </motion.div>

      <BookingForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        booking={editingBooking}
        onSuccess={fetchBookings}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Booking"
        description={
          bookingToDelete
            ? `Are you sure you want to delete booking "${bookingToDelete.booking_id}"? This can be undone by restoring.`
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
