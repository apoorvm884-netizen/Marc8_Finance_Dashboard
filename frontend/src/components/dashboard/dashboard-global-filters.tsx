import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import { vehicleService } from '@/services/vehicle.service';
import { masterService } from '@/services/master.service';
import type { Vehicle } from '@/types/vehicle';
import type { MasterValue } from '@/types/master';

export interface FilterState {
  date_from: string;
  date_to: string;
  vehicle_id: string;
  platform_id: string;
  expense_category_id: string;
  payment_mode_id: string;
  journal_category_id: string;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function DashboardGlobalFilters({ filters, onChange, onRefresh, loading }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [platforms, setPlatforms] = useState<MasterValue[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<MasterValue[]>([]);
  const [paymentModes, setPaymentModes] = useState<MasterValue[]>([]);
  const [journalCategories, setJournalCategories] = useState<MasterValue[]>([]);

  useEffect(() => {
    Promise.all([
      vehicleService.findAll({ limit: 200, is_active: 'true' }),
      masterService.getValues('platform', { limit: 100 }),
      masterService.getValues('expense_category', { limit: 100 }),
      masterService.getValues('payment_mode', { limit: 100 }),
      masterService.getValues('journal_category', { limit: 100 }),
    ]).then(([v, pl, ec, pm, jc]) => {
      setVehicles((v.data ?? []).filter((x: Vehicle) => x.is_active && !x.deleted_at));
      setPlatforms((pl.data ?? []).filter((x: MasterValue) => x.is_active && !x.deleted_at));
      setExpenseCategories((ec.data ?? []).filter((x: MasterValue) => x.is_active && !x.deleted_at));
      setPaymentModes((pm.data ?? []).filter((x: MasterValue) => x.is_active && !x.deleted_at));
      setJournalCategories((jc.data ?? []).filter((x: MasterValue) => x.is_active && !x.deleted_at));
    }).catch(() => {});
  }, []);

  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clear = () => {
    onChange({
      date_from: '', date_to: '', vehicle_id: '', platform_id: '',
      expense_category_id: '', payment_mode_id: '', journal_category_id: '',
    });
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-sm text-secondary-400 mr-2">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <Input
          type="date"
          value={filters.date_from}
          onChange={(e) => update('date_from', e.target.value)}
          className="w-36"
          placeholder="From"
        />
        <Input
          type="date"
          value={filters.date_to}
          onChange={(e) => update('date_to', e.target.value)}
          className="w-36"
          placeholder="To"
        />
        <div className="w-40">
          <Select value={filters.vehicle_id} onValueChange={(v) => update('vehicle_id', v)}>
            <SelectTrigger><SelectValue placeholder="Vehicle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Vehicles</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.vehicle_number}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={filters.platform_id} onValueChange={(v) => update('platform_id', v)}>
            <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Platforms</SelectItem>
              {platforms.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={filters.expense_category_id} onValueChange={(v) => update('expense_category_id', v)}>
            <SelectTrigger><SelectValue placeholder="Expense Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {expenseCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={filters.payment_mode_id} onValueChange={(v) => update('payment_mode_id', v)}>
            <SelectTrigger><SelectValue placeholder="Payment Mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Modes</SelectItem>
              {paymentModes.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={filters.journal_category_id} onValueChange={(v) => update('journal_category_id', v)}>
            <SelectTrigger><SelectValue placeholder="Journal Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {journalCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={onRefresh} loading={loading}>
            Apply
          </Button>
          {hasFilters && (
            <Button size="sm" variant="outline" onClick={clear}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
