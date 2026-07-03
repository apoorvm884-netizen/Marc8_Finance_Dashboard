import { useState, useEffect, useCallback } from 'react';
import { Drawer, DrawerContent, DrawerClose } from '@/components/shared/drawer';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { vehicleService } from '@/services/vehicle.service';
import { masterService } from '@/services/master.service';
import { journalService } from '@/services/journal.service';
import { useNotification } from '@/hooks/use-notification';
import type { JournalEntry, CreateJournalEntryDTO } from '@/types/journal';
import type { Vehicle } from '@/types/vehicle';
import type { MasterValue } from '@/types/master';
import { X } from 'lucide-react';

interface JournalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: JournalEntry | null;
  onSuccess: () => void;
}

interface FormState {
  vehicle_id: string;
  collection_date: string;
  amount_collected: string;
  total_amount: string;
  ledger_category_id: string;
  reference_number: string;
  description: string;
  status: string;
  remarks: string;
}

const emptyForm: FormState = {
  vehicle_id: '',
  collection_date: '',
  amount_collected: '0',
  total_amount: '0',
  ledger_category_id: '',
  reference_number: '',
  description: '',
  status: 'PENDING',
  remarks: '',
};

export function JournalForm({ open, onOpenChange, entry, onSuccess }: JournalFormProps) {
  const { notify } = useNotification();
  const isEditing = !!entry;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<MasterValue[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [vehiclesData, categoriesData] = await Promise.all([
        vehicleService.findAll({ limit: 200, is_active: 'true' }),
        masterService.getValues('journal_category', { limit: 100, sort_by: 'display_order', sort_order: 'asc' }),
      ]);
      setVehicles((vehiclesData.data ?? []).filter((v: Vehicle) => v.is_active && !v.deleted_at));
      setCategories((categoriesData.data ?? []).filter((c: MasterValue) => c.is_active && !c.deleted_at));
    } catch {
      notify.error('Failed to load form options');
    } finally {
      setLoadingOptions(false);
    }
  }, [notify]);

  useEffect(() => {
    if (open) {
      fetchOptions();
      if (entry) {
        setForm({
          vehicle_id: entry.vehicle_id,
          collection_date: entry.collection_date?.slice(0, 16) || '',
          amount_collected: String(entry.amount_collected),
          total_amount: String(entry.total_amount),
          ledger_category_id: entry.ledger_category_id,
          reference_number: entry.reference_number || '',
          description: entry.description || '',
          status: entry.status,
          remarks: entry.remarks || '',
        });
      } else {
        setForm({
          ...emptyForm,
          collection_date: new Date().toISOString().slice(0, 16),
        });
      }
    }
  }, [open, entry, fetchOptions]);

  const validate = (): string | null => {
    if (!form.vehicle_id) return 'Vehicle is required';
    if (!form.ledger_category_id) return 'Ledger category is required';
    const collected = parseFloat(form.amount_collected) || 0;
    const total = parseFloat(form.total_amount) || 0;
    if (collected < 0) return 'Amount collected must be 0 or greater';
    if (total < 0) return 'Total amount must be 0 or greater';
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
      const collected = parseFloat(form.amount_collected) || 0;
      const total = parseFloat(form.total_amount) || 0;

      const payload: CreateJournalEntryDTO = {
        vehicle_id: form.vehicle_id,
        collection_date: form.collection_date || null,
        amount_collected: collected,
        total_amount: total,
        ledger_category_id: form.ledger_category_id,
        reference_number: form.reference_number || null,
        description: form.description || null,
        status: form.status as CreateJournalEntryDTO['status'],
        remarks: form.remarks || null,
      };

      if (isEditing && entry) {
        await journalService.update(entry.id, payload);
        notify.success('Journal entry updated successfully');
      } else {
        await journalService.create(payload);
        notify.success('Journal entry created successfully');
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
            {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
          </DialogTitle>
          <DrawerClose className="rounded-md p-1 text-secondary-400 opacity-70 transition-opacity hover:opacity-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
            <X className="h-5 w-5" />
          </DrawerClose>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Vehicle *</Label>
              <Select
                value={form.vehicle_id}
                onValueChange={(v) => setForm({ ...form, vehicle_id: v })}
                disabled={loadingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vehicle_number} - {v.vehicle_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Collection Date & Time</Label>
              <Input
                type="datetime-local"
                value={form.collection_date}
                onChange={(e) => setForm({ ...form, collection_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Amount Collected (₹) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.amount_collected}
              onChange={(e) => setForm({ ...form, amount_collected: e.target.value })}
            />
            <Input
              label="Total Amount (₹) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.total_amount}
              onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Reference Number"
              placeholder="e.g. JRNL-001"
              value={form.reference_number}
              onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
            />
            <div className="space-y-1.5">
              <Label>Ledger Category *</Label>
              <Select
                value={form.ledger_category_id}
                onValueChange={(v) => setForm({ ...form, ledger_category_id: v })}
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
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
              placeholder="Optional description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
            {isEditing ? 'Update Journal Entry' : 'Create Journal Entry'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
