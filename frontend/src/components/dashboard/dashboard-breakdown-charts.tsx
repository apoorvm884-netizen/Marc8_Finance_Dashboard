import { motion } from 'framer-motion';
import { ChartCard } from '@/components/shared/chart-card';
import type { Breakdowns } from '@/types/dashboard';
import { PieChart, BarChart3, Truck, Receipt } from 'lucide-react';

interface Props {
  breakdowns: Breakdowns | null;
  loading: boolean;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const COLORS = [
  { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-400' },
  { bar: 'bg-blue-500', dot: 'bg-blue-500', text: 'text-blue-400' },
  { bar: 'bg-violet-500', dot: 'bg-violet-500', text: 'text-violet-400' },
  { bar: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-400' },
  { bar: 'bg-cyan-500', dot: 'bg-cyan-500', text: 'text-cyan-400' },
  { bar: 'bg-rose-500', dot: 'bg-rose-500', text: 'text-rose-400' },
  { bar: 'bg-indigo-500', dot: 'bg-indigo-500', text: 'text-indigo-400' },
  { bar: 'bg-orange-500', dot: 'bg-orange-500', text: 'text-orange-400' },
];

function PieBar({ label, value, total, index }: { label: string; value: number; total: number; index: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const color = COLORS[index % COLORS.length]!;
  return (
    <div className="group/bar flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-white/[0.03]">
      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${color.dot}`} />
      <span className="flex-1 text-sm text-secondary-300 truncate">{label}</span>
      <div className="flex-1 h-4 bg-surface-light rounded-full overflow-hidden max-w-[120px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
          className={`h-full rounded-full transition-all duration-300 ${color.bar} group-hover/bar:opacity-80`}
        />
      </div>
      <span className="w-24 text-right text-xs text-white font-mono tabular-nums">
        ₹{Math.round(value).toLocaleString('en-IN')}
      </span>
      <span className="w-10 text-right text-xs text-secondary-500 tabular-nums">{Math.round(pct)}%</span>
    </div>
  );
}

export function DashboardBreakdownCharts({ breakdowns, loading }: Props) {
  const revPlatformTotal = breakdowns ? breakdowns.revenue_by_platform.reduce((s, p) => s + p.total, 0) : 0;
  const expCategoryTotal = breakdowns ? breakdowns.expense_by_category.reduce((s, c) => s + c.total, 0) : 0;
  const revVehicleTotal = breakdowns ? breakdowns.revenue_by_vehicle.reduce((s, v) => s + v.total, 0) : 0;
  const collCategoryTotal = breakdowns ? breakdowns.collections_by_category.reduce((s, c) => s + c.total, 0) : 0;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <motion.div variants={item}>
        <ChartCard title="Revenue by Platform" subtitle="Top revenue-generating platforms" loading={loading} action={<PieChart className="h-4 w-4 text-emerald-400" />}>
          {breakdowns && breakdowns.revenue_by_platform.length > 0 ? (
            <div className="space-y-1.5">
              {breakdowns.revenue_by_platform.map((p, i) => (
                <PieBar key={p.platform_id} label={p.platform_name} value={p.total} total={revPlatformTotal} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No platform data</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Expense by Category" subtitle="Largest expense categories" loading={loading} action={<BarChart3 className="h-4 w-4 text-red-400" />}>
          {breakdowns && breakdowns.expense_by_category.length > 0 ? (
            <div className="space-y-1.5">
              {breakdowns.expense_by_category.map((c, i) => (
                <PieBar key={c.category_id} label={c.category_name} value={c.total} total={expCategoryTotal} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No expense data</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Revenue by Vehicle" subtitle="Top vehicles by revenue" loading={loading} action={<Truck className="h-4 w-4 text-emerald-400" />}>
          {breakdowns && breakdowns.revenue_by_vehicle.length > 0 ? (
            <div className="space-y-1.5">
              {breakdowns.revenue_by_vehicle.slice(0, 8).map((v, i) => (
                <PieBar key={v.vehicle_id} label={v.vehicle_number} value={v.total} total={revVehicleTotal} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No vehicle data</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Collections by Category" subtitle="Revenue collection breakdown" loading={loading} action={<Receipt className="h-4 w-4 text-blue-400" />}>
          {breakdowns && breakdowns.collections_by_category.length > 0 ? (
            <div className="space-y-1.5">
              {breakdowns.collections_by_category.map((c, i) => (
                <PieBar key={c.category_id} label={c.category_name} value={c.total} total={collCategoryTotal} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No collection data</p></div>
          )}
        </ChartCard>
      </motion.div>
    </div>
  );
}
