import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { useDebounce } from '@/hooks/use-debounce';
import { masterService } from '@/services/master.service';
import type { MasterValue } from '@/types/master';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/shared/search-input';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Drawer, DrawerContent, DrawerClose } from '@/components/shared/drawer';
import { DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Undo2,
  X,
  Save,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

const masterTypeLabels: Record<string, { title: string; description: string }> = {
  platform: { title: 'Platforms', description: 'Manage booking platforms' },
  expense_category: { title: 'Expense Categories', description: 'Manage expense categories' },
  journal_category: { title: 'Journal Categories', description: 'Manage journal entry categories' },
  payment_mode: { title: 'Payment Modes', description: 'Manage payment methods' },
  fuel_type: { title: 'Fuel Types', description: 'Manage fuel type options' },
  vehicle_status: { title: 'Vehicle Status', description: 'Manage vehicle status options' },
  ownership_type: { title: 'Ownership Types', description: 'Manage ownership types' },
  transmission_type: { title: 'Transmission Types', description: 'Manage transmission options' },
};

export default function MasterDataPage() {
  const { type } = useParams<{ type: string }>();
  const { user } = useAuth();
  const { notify } = useNotification();
  const [searchParams] = useSearchParams();

  const [values, setValues] = useState<MasterValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(Number(searchParams.get('limit')) || 10);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<MasterValue | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '', display_order: 0, color: '', icon: '', is_active: true });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [valueToDelete, setValueToDelete] = useState<MasterValue | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  const pageInfo = (type ? masterTypeLabels[type] : undefined) ?? { title: 'Master Data', description: '' };

  const fetchValues = useCallback(async () => {
    if (!type) return;
    setLoading(true);
    setError(null);
    try {
      const result = await masterService.getValues(type, {
        page,
        limit,
        sort_by: 'display_order',
        sort_order: 'asc',
        search: debouncedSearch || undefined,
      });
      setValues(result.data ?? []);
      setTotal(result.total ?? 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load values';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [type, page, limit, debouncedSearch]);

  useEffect(() => {
    fetchValues();
  }, [fetchValues]);

  const openCreateDrawer = () => {
    setEditingValue(null);
    setFormData({ code: '', name: '', description: '', display_order: values.length + 1, color: '', icon: '', is_active: true });
    setDrawerOpen(true);
  };

  const openEditDrawer = (value: MasterValue) => {
    setEditingValue(value);
    setFormData({
      code: value.code,
      name: value.name,
      description: value.description || '',
      display_order: value.display_order,
      color: value.color || '',
      icon: value.icon || '',
      is_active: value.is_active,
    });
    setDrawerOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!type) return;
    if (!formData.code.trim() || !formData.name.trim()) {
      notify.error('Code and Name are required');
      return;
    }
    setFormSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        display_order: formData.display_order || 0,
        color: formData.color || null,
        icon: formData.icon || null,
        is_active: formData.is_active,
      };

      if (editingValue) {
        await masterService.update(type, editingValue.id, payload);
        notify.success('Value updated successfully');
      } else {
        await masterService.create(type, payload);
        notify.success('Value created successfully');
      }
      setDrawerOpen(false);
      fetchValues();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      notify.error(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteClick = (value: MasterValue) => {
    setValueToDelete(value);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!type || !valueToDelete) return;
    setIsDeleting(true);
    try {
      await masterService.delete(type, valueToDelete.id);
      notify.success('Value deleted');
      setDeleteDialogOpen(false);
      setValueToDelete(null);
      fetchValues();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (value: MasterValue) => {
    if (!type) return;
    try {
      await masterService.restore(type, value.id);
      notify.success('Value restored');
      fetchValues();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to restore');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Code', 'Name', 'Description', 'Display Order', 'Color', 'Active'];
    const rows = values.map((v) => [v.code, v.name, v.description || '', v.display_order, v.color || '', v.is_active ? 'Yes' : 'No']);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type || 'master'}-values.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<MasterValue>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-medium text-white font-mono text-xs">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.color && (
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: row.original.color }}
            />
          )}
          <span className="text-white">{row.original.name}</span>
          {row.original.is_system && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">System</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'display_order',
      header: 'Order',
      size: 60,
      cell: ({ row }) => (
        <span className="text-secondary-300">{row.original.display_order}</span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Active',
      size: 60,
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'secondary'} dot>
          {row.original.is_active ? 'Active' : 'Inactive'}
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
            <DropdownMenuItem onClick={() => openEditDrawer(row.original)} disabled={!isAdmin}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {row.original.deleted_at ? (
              <DropdownMenuItem onClick={() => handleRestore(row.original)} disabled={!isAdmin}>
                <Undo2 className="mr-2 h-4 w-4" />
                Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => handleDeleteClick(row.original)}
                disabled={!isAdmin || row.original.is_system}
                className={row.original.is_system ? 'opacity-50' : 'text-red-400'}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {row.original.is_system ? 'System' : 'Delete'}
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
        title={pageInfo.title}
        description={pageInfo.description}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={fetchValues} loading={loading}>
              Refresh
            </Button>
            {isAdmin && (
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={openCreateDrawer}>
                Add Value
              </Button>
            )}
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-64">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search values..." />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={values}
          loading={loading}
          error={error}
          onRetry={fetchValues}
          enableColumnVisibility
          enableExport
          onExportCSV={handleExportCSV}
          emptyMessage="No values found"
          pageSize={limit}
          searchable={false}
        />

        {total > 0 && (
          <div className="flex items-center justify-between text-sm text-secondary-400">
            <span>Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="px-2">{page} / {Math.ceil(total / limit)}</span>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </motion.div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent size="md">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <DialogTitle className="text-lg">
              {editingValue ? 'Edit Value' : 'Add Value'}
            </DialogTitle>
            <DrawerClose className="rounded-md p-1 text-secondary-400 opacity-70 transition-opacity hover:opacity-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
              <X className="h-5 w-5" />
            </DrawerClose>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <Input
              label="Code *"
              placeholder="e.g. NEW_TYPE"
              disabled={!!editingValue?.is_system}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
            />
            <Input
              label="Name *"
              placeholder="e.g. New Type"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Display Order"
                type="number"
                min="0"
                value={String(formData.display_order)}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Color (hex)"
                placeholder="e.g. #10B981"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
            <Input
              label="Icon (lucide name)"
              placeholder="e.g. Fuel"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-border bg-surface text-accent-500 focus:ring-accent-500"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button>
            </DrawerClose>
            <Button onClick={handleFormSubmit} loading={formSubmitting} icon={<Save className="h-4 w-4" />}>
              {editingValue ? 'Update' : 'Create'}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Value"
        description={
          valueToDelete
            ? `Are you sure you want to delete "${valueToDelete.name}"? System values cannot be deleted.`
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
