import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Drawer, DrawerContent, DrawerClose } from '@/components/shared/drawer';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { scheduleFormSchema, type ScheduleFormData } from '@/validation/scheduler';
import { schedulerService } from '@/services/scheduler.service';
import { vehicleService } from '@/services/vehicle.service';
import { useNotification } from '@/hooks/use-notification';
import type { ServiceSchedule } from '@/types/scheduler';
import type { Vehicle } from '@/types/vehicle';
import { X } from 'lucide-react';

interface ScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: ServiceSchedule | null;
  onSuccess: () => void;
}

export function ScheduleForm({ open, onOpenChange, schedule, onSuccess }: ScheduleFormProps) {
  const { notify } = useNotification();
  const isEditing = !!schedule;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    vehicleService.findAll({ limit: 100 }).then((res) => {
      setVehicles(res.data ?? []);
    }).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema) as unknown as Resolver<ScheduleFormData>,
    defaultValues: {
      vehicle_id: '',
      service_type: 'both',
      interval_km: '' as unknown as undefined,
      interval_days: '' as unknown as undefined,
      last_service_km: '' as unknown as undefined,
      last_service_date: '',
      is_recurring: true,
      notes: '',
    },
  });

  const watchedVehicleId = watch('vehicle_id');
  const watchedServiceType = watch('service_type');
  const watchedIsRecurring = watch('is_recurring');

  useEffect(() => {
    if (schedule) {
      reset({
        vehicle_id: schedule.vehicle_id,
        service_type: schedule.service_type as ScheduleFormData['service_type'],
        interval_km: schedule.interval_km ?? ('' as unknown as undefined),
        interval_days: schedule.interval_days ?? ('' as unknown as undefined),
        last_service_km: schedule.last_service_km ?? ('' as unknown as undefined),
        last_service_date: schedule.last_service_date || '',
        is_recurring: schedule.is_recurring,
        notes: schedule.notes || '',
      });
    } else {
      reset({
        vehicle_id: '',
        service_type: 'both',
        interval_km: '' as unknown as undefined,
        interval_days: '' as unknown as undefined,
        last_service_km: '' as unknown as undefined,
        last_service_date: '',
        is_recurring: true,
        notes: '',
      });
    }
  }, [schedule, reset, open]);

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      const payload = {
        vehicle_id: data.vehicle_id,
        service_type: data.service_type,
        interval_km: data.interval_km ?? null,
        interval_days: data.interval_days ?? null,
        last_service_km: data.last_service_km ?? null,
        last_service_date: data.last_service_date || null,
        is_recurring: data.is_recurring,
        notes: data.notes || null,
      };

      if (isEditing && schedule) {
        await schedulerService.update(schedule.id, payload);
        notify.success('Schedule updated successfully');
      } else {
        await schedulerService.create(payload);
        notify.success('Schedule created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Operation failed';
      notify.error(message);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">
            {isEditing ? 'Edit Schedule' : 'Add Schedule'}
          </DialogTitle>
          <DrawerClose className="rounded-md p-1 text-secondary-400 opacity-70 transition-opacity hover:opacity-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
            <X className="h-5 w-5" />
          </DrawerClose>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-1.5">
                <Label>Vehicle *</Label>
                <Select
                  value={watchedVehicleId}
                  onValueChange={(v) => setValue('vehicle_id', v)}
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
                {errors.vehicle_id?.message && (
                  <p className="text-xs text-red-400">{errors.vehicle_id.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Service Type *</Label>
                <Select
                  value={watchedServiceType || 'both'}
                  onValueChange={(v) => setValue('service_type', v as ScheduleFormData['service_type'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Time Based</SelectItem>
                    <SelectItem value="distance">Distance Based</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                {errors.service_type?.message && (
                  <p className="text-xs text-red-400">{errors.service_type.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Interval (km)"
                  type="number"
                  placeholder="e.g. 5000"
                  min="0"
                  error={errors.interval_km?.message}
                  {...register('interval_km')}
                />
                <Input
                  label="Interval (days)"
                  type="number"
                  placeholder="e.g. 90"
                  min="0"
                  error={errors.interval_days?.message}
                  {...register('interval_days')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Last Service (km)"
                  type="number"
                  placeholder="e.g. 45000"
                  min="0"
                  error={errors.last_service_km?.message}
                  {...register('last_service_km')}
                />
                <Input
                  label="Last Service Date"
                  type="date"
                  error={errors.last_service_date?.message}
                  {...register('last_service_date')}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={watchedIsRecurring}
                  onChange={(e) => setValue('is_recurring', e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-surface text-accent-500 focus:ring-accent-500"
                />
                <Label htmlFor="is_recurring">Recurring Schedule</Label>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                  placeholder="Schedule notes..."
                  {...register('notes')}
                />
                {errors.notes?.message && (
                  <p className="text-xs text-red-400">{errors.notes.message}</p>
                )}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
