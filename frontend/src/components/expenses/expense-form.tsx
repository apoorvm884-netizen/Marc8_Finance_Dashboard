import { useState, useEffect, useCallback } from 'react';
import { Drawer, DrawerContent, DrawerClose } from '@/components/shared/drawer';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { vehicleService } from '@/services/vehicle.service';
import { masterService } from '@/services/master.service';
import { expenseService } from '@/services/expense.service';
import { useNotification } from '@/hooks/use-notification';
import type { Expense, CreateExpenseDTO } from '@/types/expense';
import type { Vehicle } from '@/types/vehicle';
import type { MasterValue } from '@/types/master';
import { X } from 'lucide-react';

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  onSuccess: () => void;
}

interface FormState {
  vehicle_id: string;
  expense_category_id: string;
  payment_mode_id: string;
  expense_date: string;
  amount: string;
  vendor: string;
  invoice_number: string;
  status: string;
  remarks: string;
}

const emptyForm: FormState = {
  vehicle_id: '',
  expense_category_id: '',
  payment_mode_id: '',
  expense_date: '',
  amount: '0',
  vendor: '',
  invoice_number: '',
  status: 'PENDING',
  remarks: '',
};

export function ExpenseForm({ open, onOpenChange, expense, onSuccess }: ExpenseFormProps) {
  const { notify } = useNotification();
  const isEditing = !!expense;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<MasterValue[]>([]);
  const [paymentModes, setPaymentModes] = useState<MasterValue[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const amount = parseFloat(form.amount) || 0;

  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [vehiclesData, categoriesData, modesData] = await Promise.all([
        vehicleService.findAll({ limit: 200, is_active: 'true' }),
        masterService.getValues('expense_category', { limit: 100, sort_by: 'display_order', sort_order: 'asc' }),
        masterService.getValues('payment_mode', { limit: 100, sort_by: 'display_order', sort_order: 'asc' }),
      ]);
      setVehicles((vehiclesData.data ?? []).filter((v: Vehicle) => v.is_active && !v.deleted_at));
      setCategories((categoriesData.data ?? []).filter((c: MasterValue) => c.is_active && !c.deleted_at));
      setPaymentModes((modesData.data ?? []).filter((m: MasterValue) => m.is_active && !m.deleted_at));
    } catch {
      notify.error('Failed to load form options');
    } finally {
      setLoadingOptions(false);
    }
  }, [notify]);

  useEffect(() => {
    if (open) {
      fetchOptions();
      if (expense) {
        setForm({
          vehicle_id: expense.vehicle_id || '',
          expense_category_id: expense.expense_category_id,
          payment_mode_id: expense.payment_mode_id,
          expense_date: expense.expense_date?.slice(0, 16) || '',
          amount: String(expense.amount),
          vendor: expense.vendor || '',
          invoice_number: expense.invoice_number || '',
          status: expense.status,
          remarks: expense.remarks || '',
        });
      } else {
        setForm({
          ...emptyForm,
          expense_date: new Date().toISOString().slice(0, 16),
        });
      }
    }
  }, [open, expense, fetchOptions]);

  const validate = (): string | null => {
    if (!form.expense_category_id) return 'Expense category is required';
    if (!form.payment_mode_id) return 'Payment mode is required';
    if (amount < 0) return 'Amount must be 0 or greater';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      notify.error(error);
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateExpenseDTO = {
        vehicle_id: form.vehicle_id || null,
        expense_category_id: form.expense_category_id,
        payment_mode_id: form.payment_mode_id,
        expense_date: form.expense_date || undefined,
        amount: amount,
        vendor: form.vendor || null,
        invoice_number: form.invoice_number || null,
        status: form.status as CreateExpenseDTO['status'],
        remarks: form.remarks || null,
      };

      if (isEditing && expense) {
        await expenseService.update(expense.id, payload);
        notify.success('Expense updated successfully');
      } else {
        await expenseService.create(payload);
        notify.success('Expense created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      notify.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">
            {isEditing ? 'Edit Expense' : 'New Expense'}
          </DialogTitle>
          <DrawerClose className="rounded-md p-1 text-secondary-400 opacity-70 transition-opacity hover:opacity-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
            <X className="h-5 w-5" />
          </DrawerClose>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Vehicle (Optional)</Label>
              <Select
                value={form.vehicle_id}
                onValueChange={(v) => setForm({ ...form, vehicle_id: v })}
                disabled={loadingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Vehicle</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vehicle_number} - {v.vehicle_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              label="Expense Date & Time"
              type="datetime-local"
              value={form.expense_date}
              onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Expense Category *</Label>
              <Select
                value={form.expense_category_id}
                onValueChange={(v) => setForm({ ...form, expense_category_id: v })}
                disabled={loadingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Payment Mode *</Label>
              <Select
                value={form.payment_mode_id}
                onValueChange={(v) => setForm({ ...form, payment_mode_id: v })}
                disabled={loadingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Amount (₹) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <Input
              label="Vendor"
              placeholder="e.g. Indian Oil"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            />
            <Input
              label="Invoice Number"
              placeholder="e.g. INV-001"
              value={form.invoice_number}
              onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="REIMBURSED">Reimbursed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Remarks</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
              placeholder="Optional remarks..."
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <DrawerClose asChild>
            <Button type="button" variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} loading={submitting}>
            {isEditing ? 'Update Expense' : 'Create Expense'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
