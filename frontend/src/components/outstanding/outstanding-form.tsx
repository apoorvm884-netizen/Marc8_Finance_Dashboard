import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotification } from '@/hooks/use-notification';
import { outstandingService } from '@/services/outstanding.service';
import { vehicleService } from '@/services/vehicle.service';
import { masterService } from '@/services/master.service';
import { Drawer, DrawerContent, DrawerClose } from '@/components/shared/drawer';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Outstanding, CreateOutstandingDTO, UpdateOutstandingDTO } from '@/types/outstanding';
import type { Vehicle } from '@/types/vehicle';
import type { MasterValue } from '@/types/master';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outstanding?: Outstanding | null;
  onSuccess: () => void;
}

export function OutstandingForm({ open, onOpenChange, outstanding, onSuccess }: Props) {
  const { notify } = useNotification();
  const isEditing = !!outstanding;

  const [title, setTitle] = useState('');
  const [outstandingCategoryId, setOutstandingCategoryId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<MasterValue[]>([]);
  const [platforms, setPlatforms] = useState<MasterValue[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (outstanding) {
        setTitle(outstanding.title);
        setOutstandingCategoryId(outstanding.outstanding_category_id);
        setVehicleId(outstanding.vehicle_id || '');
        setPlatformId(outstanding.platform_id || '');
        setVendor(outstanding.vendor || '');
        setAmount(String(outstanding.amount));
        setDueDate(outstanding.due_date);
        setPriority(outstanding.priority);
        setNotes(outstanding.notes || '');
      } else {
        setTitle('');
        setOutstandingCategoryId('');
        setVehicleId('');
        setPlatformId('');
        setVendor('');
        setAmount('');
        setDueDate('');
        setPriority('normal');
        setNotes('');
      }

      Promise.all([
        vehicleService.findAll({ limit: 200, is_active: 'true' }),
        masterService.getValues('outstanding_category', { limit: 100, sort_by: 'display_order', sort_order: 'asc' }),
        masterService.getValues('platform', { limit: 100, sort_by: 'display_order', sort_order: 'asc' }),
      ]).then(([vData, cData, pData]) => {
        setVehicles((vData.data ?? []).filter((v: Vehicle) => v.is_active && !v.deleted_at));
        setCategories((cData.data ?? []).filter((c: MasterValue) => c.is_active && !c.deleted_at));
        setPlatforms((pData.data ?? []).filter((p: MasterValue) => p.is_active && !p.deleted_at));
      }).catch(() => {});
    }
  }, [open, outstanding]);

  const handleSubmit = async () => {
    if (!title.trim()) { notify.error('Title is required'); return; }
    if (!outstandingCategoryId) { notify.error('Category is required'); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0) { notify.error('Valid amount is required'); return; }
    if (!dueDate) { notify.error('Due date is required'); return; }

    setSaving(true);
    try {
      const payload: CreateOutstandingDTO | UpdateOutstandingDTO = {
        title: title.trim(),
        outstanding_category_id: outstandingCategoryId,
        vehicle_id: vehicleId || null,
        platform_id: platformId || null,
        vendor: vendor.trim() || null,
        amount: Number(amount),
        due_date: dueDate,
        priority: priority as any,
        notes: notes.trim() || null,
      };

      if (isEditing) {
        await outstandingService.update(outstanding!.id, payload as UpdateOutstandingDTO);
        notify.success('Outstanding updated');
      } else {
        await outstandingService.create(payload as CreateOutstandingDTO);
        notify.success('Outstanding created');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="md">
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <DialogTitle className="text-xl font-semibold text-white">
              {isEditing ? 'Edit Outstanding' : 'New Outstanding'}
            </DialogTitle>
            <p className="text-sm text-secondary-400 mt-1">
              {isEditing ? 'Update liability details' : 'Create a new outstanding liability'}
            </p>
          </div>
          <DrawerClose />
        </div>
        <div className="space-y-6 p-6">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Insurance Due - KA01AB1234" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={outstandingCategoryId} onValueChange={setOutstandingCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input id="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.vehicle_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platformId} onValueChange={setPlatformId}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input id="vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor name" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
              className={cn(
                'flex w-full rounded-lg border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200',
                'border-border focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20',
                'resize-none'
              )}
            />
          </div>
        </motion.div>

        </div>
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEditing ? 'Update' : 'Create'} Outstanding
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
