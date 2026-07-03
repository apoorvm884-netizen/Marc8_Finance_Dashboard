import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Drawer, DrawerContent, DrawerClose } from '@/components/shared/drawer';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { settlementFormSchema, type SettlementFormData } from '@/validation/settlement';
import { settlementService } from '@/services/settlement.service';
import { useNotification } from '@/hooks/use-notification';
import type { Settlement } from '@/types/settlement';

interface SettlementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settlement?: Settlement | null;
  onSuccess: () => void;
}

export function SettlementForm({ open, onOpenChange, settlement, onSuccess }: SettlementFormProps) {
  const { notify } = useNotification();
  const isEditing = !!settlement;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } }
    = useForm<SettlementFormData>({
      resolver: zodResolver(settlementFormSchema),
      defaultValues: {
        period_start: '',
        period_end: '',
        owner_id: '',
        vehicle_id: '',
        platform_id: '',
        settlement_type: '',
        revenue_model: '',
        notes: '',
      },
    });

  useEffect(() => {
    if (settlement) {
      reset({
        period_start: settlement.period_start?.substring(0, 10) || '',
        period_end: settlement.period_end?.substring(0, 10) || '',
        owner_id: settlement.owner_id || '',
        vehicle_id: settlement.vehicle_id || '',
        platform_id: settlement.platform_id || '',
        settlement_type: settlement.settlement_type || '',
        revenue_model: settlement.revenue_model || '',
        notes: settlement.notes || '',
      });
    } else {
      reset({
        period_start: '',
        period_end: '',
        owner_id: '',
        vehicle_id: '',
        platform_id: '',
        settlement_type: 'owner',
        revenue_model: 'profit_share_percent',
        notes: '',
      });
    }
  }, [settlement, reset, open]);

  const onSubmit = async (data: SettlementFormData) => {
    try {
      if (isEditing && settlement) {
        await settlementService.update(settlement.id, {
          period_start: data.period_start,
          period_end: data.period_end,
          owner_id: data.owner_id || null,
          vehicle_id: data.vehicle_id || null,
          platform_id: data.platform_id || null,
          settlement_type: (data.settlement_type as 'owner' | 'platform') || 'owner',
          revenue_model: data.revenue_model || undefined,
          notes: data.notes || null,
        });
        notify.success('Settlement updated successfully');
      } else {
        await settlementService.create({
          period_start: data.period_start,
          period_end: data.period_end,
          owner_id: data.owner_id || null,
          vehicle_id: data.vehicle_id || null,
          platform_id: data.platform_id || null,
          settlement_type: (data.settlement_type as 'owner' | 'platform') || 'owner',
          revenue_model: data.revenue_model || undefined,
          notes: data.notes || null,
        });
        notify.success('Settlement created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed to save settlement');
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle>{isEditing ? 'Edit Settlement' : 'Create Settlement'}</DialogTitle>
          <DrawerClose />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">
                  Settlement Period
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Period Start *"
                    type="date"
                    placeholder="YYYY-MM-DD"
                    error={errors.period_start?.message}
                    {...register('period_start')}
                  />
                  <Input
                    label="Period End *"
                    type="date"
                    placeholder="YYYY-MM-DD"
                    error={errors.period_end?.message}
                    {...register('period_end')}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">
                  Configuration
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-secondary-300">Settlement Type</label>
                    <Select
                      value={watch('settlement_type')}
                      onValueChange={(v) => setValue('settlement_type', v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner Settlement</SelectItem>
                        <SelectItem value="platform">Platform Settlement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-secondary-300">Revenue Model</label>
                    <Select
                      value={watch('revenue_model')}
                      onValueChange={(v) => setValue('revenue_model', v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profit_share_percent">Profit Share %</SelectItem>
                        <SelectItem value="revenue_share_percent">Revenue Share %</SelectItem>
                        <SelectItem value="fixed_monthly">Fixed Monthly</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="minimum_guarantee">Minimum Guarantee</SelectItem>
                        <SelectItem value="custom_formula">Custom Formula</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    label="Owner ID"
                    placeholder="UUID"
                    {...register('owner_id')}
                  />
                  <Input
                    label="Vehicle ID"
                    placeholder="UUID"
                    {...register('vehicle_id')}
                  />
                  <Input
                    label="Platform ID"
                    placeholder="UUID"
                    {...register('platform_id')}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">
                  Notes
                </h3>
                <div>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Additional notes..."
                    {...register('notes')}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
            </DrawerClose>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Update Settlement' : 'Create Settlement'}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
