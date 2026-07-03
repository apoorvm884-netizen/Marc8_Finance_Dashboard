import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useNotification } from '@/hooks/use-notification';
import { settlementService } from '@/services/settlement.service';
import { Play } from 'lucide-react';

interface PipelineRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PipelineForm {
  period_start: string;
  period_end: string;
  owner_id: string;
  vehicle_id: string;
  platform_id: string;
  revenue_model: string;
  notes: string;
}

export function PipelineRunDialog({ open, onOpenChange, onSuccess }: PipelineRunDialogProps) {
  const { notify } = useNotification();
  const [form, setForm] = useState<PipelineForm>({
    period_start: '',
    period_end: '',
    owner_id: '',
    vehicle_id: '',
    platform_id: '',
    revenue_model: 'profit_share_percent',
    notes: '',
  });
  const [running, setRunning] = useState(false);

  const handleSubmit = async () => {
    if (!form.period_start || !form.period_end) {
      notify.error('Period start and end are required');
      return;
    }

    setRunning(true);
    try {
      await settlementService.runPipeline({
        period_start: form.period_start,
        period_end: form.period_end,
        owner_id: form.owner_id || null,
        vehicle_id: form.vehicle_id || null,
        platform_id: form.platform_id || null,
        revenue_model: form.revenue_model || undefined,
        notes: form.notes || null,
      });
      notify.success('Settlement pipeline executed successfully');
      onSuccess();
      onOpenChange(false);
      setForm({
        period_start: '',
        period_end: '',
        owner_id: '',
        vehicle_id: '',
        platform_id: '',
        revenue_model: 'profit_share_percent',
        notes: '',
      });
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Pipeline execution failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-accent-500" />
            Run Settlement Pipeline
          </DialogTitle>
          <DialogDescription>
            The pipeline will aggregate completed bookings and approved expenses for the period, apply the revenue model, and create a settlement draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Period Start *"
              type="date"
              value={form.period_start}
              onChange={(e) => setForm({ ...form, period_start: e.target.value })}
            />
            <Input
              label="Period End *"
              type="date"
              value={form.period_end}
              onChange={(e) => setForm({ ...form, period_end: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary-300">Revenue Model</label>
            <Select
              value={form.revenue_model}
              onValueChange={(v) => setForm({ ...form, revenue_model: v })}
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Owner ID (optional)"
              placeholder="Filter by owner"
              value={form.owner_id}
              onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
            />
            <Input
              label="Vehicle ID (optional)"
              placeholder="Filter by vehicle"
              value={form.vehicle_id}
              onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-secondary-300">Notes</label>
            <textarea
              className="mt-1 flex min-h-[60px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1"
              placeholder="Optional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={running}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={running}>
            Run Pipeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
