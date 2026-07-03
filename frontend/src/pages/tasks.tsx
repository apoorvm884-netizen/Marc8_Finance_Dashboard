import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListTodo, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { taskService } from '@/services/task.service';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { Drawer, DrawerContent, DrawerClose } from '@/components/shared/drawer';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Task, CreateTaskDTO, TaskPriority, TaskStatus } from '@/types/workflow';
import type { ColumnDef } from '@tanstack/react-table';

interface TaskFormState {
  title: string;
  description: string;
  assigned_to: string;
  priority: TaskPriority;
  due_at: string;
}

const emptyForm: TaskFormState = { title: '', description: '', assigned_to: '', priority: 'normal', due_at: '' };

export default function TasksPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const canCreate = user && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
  const canEdit = user && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
  const canDelete = user && ['SUPER_ADMIN', 'ADMIN'].includes(user.role);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await taskService.findAll({
        page: String(page),
        limit: String(limit),
        sort_by: 'created_at',
        sort_order: 'desc',
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setTasks(result.data ?? []);
      if (result.meta) {
        setTotal(result.meta.total);
        setTotalPages(result.meta.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (statusFilter) params.set('status', statusFilter);
    if (priorityFilter) params.set('priority', priorityFilter);
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, statusFilter, priorityFilter, page, setSearchParams]);

  const resetForm = () => setForm(emptyForm);

  const handleCreate = () => {
    setEditingTask(null);
    resetForm();
    setDrawerOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      assigned_to: task.assigned_to || '',
      priority: task.priority,
      due_at: task.due_at ? task.due_at.slice(0, 16) : '',
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      notify.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateTaskDTO = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        assigned_to: form.assigned_to || undefined,
        due_at: form.due_at || undefined,
      };
      if (editingTask) {
        await taskService.update(editingTask.id, payload);
        notify.success('Task updated');
      } else {
        await taskService.create(payload);
        notify.success('Task created');
      }
      setDrawerOpen(false);
      fetchTasks();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await taskService.delete(deletingTask.id);
      notify.success('Task deleted');
      setDeleteDialogOpen(false);
      setDeletingTask(null);
      fetchTasks();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <span className="font-medium text-white">{row.original.title}</span>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <Badge variant={
          row.original.priority === 'urgent' ? 'destructive' :
          row.original.priority === 'high' ? 'warning' :
          row.original.priority === 'low' ? 'default' : 'secondary'
        }>
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={
          row.original.status === 'completed' ? 'success' :
          row.original.status === 'in_progress' ? 'warning' :
          row.original.status === 'cancelled' ? 'destructive' : 'default'
        }>
          {row.original.status?.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'assigned_to_name',
      header: 'Assignee',
      cell: ({ row }) => (
        <span className="text-secondary-300">{row.original.assigned_to_name || '-'}</span>
      ),
    },
    {
      accessorKey: 'due_at',
      header: 'Due',
      cell: ({ row }) => (
        <span className="text-xs text-secondary-400">
          {row.original.due_at ? new Date(row.original.due_at).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {canEdit && (
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Pencil /> Edit
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem onClick={() => handleDeleteClick(row.original)} className="text-red-400">
                <Trash2 /> Delete
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
        title="Tasks"
        description="Manage operational tasks and assignments"
        actions={
          canCreate && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
          )
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search tasks..." className="w-64" />
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={tasks}
          loading={loading}
          error={error}
          onRetry={fetchTasks}
          pageSize={limit}
          emptyMessage="No tasks found"
          emptyIcon={<ListTodo className="h-8 w-8 text-secondary-500" />}
        />
      </motion.div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent size="md">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
            <DrawerClose />
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter task title" />
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-accent"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Task description"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as TaskPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input label="Due Date" type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>{editingTask ? 'Update' : 'Create'}</Button>
          </div>
        </DrawerContent>
      </Drawer>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
