import { motion } from 'framer-motion';
import { ChartCard } from '@/components/shared/chart-card';
import type { Trends } from '@/types/dashboard';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface Props {
  trends: Trends | null;
  loading: boolean;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function TrendBar({ label, value, maxValue, color, index }: { label: string; value: number; maxValue: number; color: string; index: number }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="group/bar flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-white/[0.03]">
      <span className="w-16 text-xs text-secondary-400 shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-surface-light rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
          className={`h-full rounded-full transition-all duration-300 ${color} group-hover/bar:opacity-80`}
        />
      </div>
      <span className="w-24 text-right text-xs text-white font-mono tabular-nums">
        ₹{Math.round(value).toLocaleString('en-IN')}
      </span>
    </div>
  );
}

export function DashboardTrendCharts({ trends, loading }: Props) {
  const revenueMax = trends ? Math.max(...trends.revenue.map(t => t.total), 1) : 1;
  const expenseMax = trends ? Math.max(...trends.expense.map(t => t.total), 1) : 1;
  const profitMax = trends ? Math.max(...trends.profit.map(t => Math.abs(t.total)), 1) : 1;
  const cashFlowMax = trends ? Math.max(...trends.cash_flow.flatMap(c => [c.inflows, c.outflows]), 1) : 1;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <motion.div variants={item}>
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue over time" loading={loading} action={<TrendingUp className="h-4 w-4 text-emerald-400" />}>
          {trends && trends.revenue.length > 0 ? (
            <div className="space-y-1.5">
              {trends.revenue.slice(-6).map((t, i) => (
                <TrendBar key={t.month} label={t.month} value={t.total} maxValue={revenueMax} color="bg-emerald-500" index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No revenue data yet</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Expense Trend" subtitle="Monthly expense over time" loading={loading} action={<TrendingDown className="h-4 w-4 text-red-400" />}>
          {trends && trends.expense.length > 0 ? (
            <div className="space-y-1.5">
              {trends.expense.slice(-6).map((t, i) => (
                <TrendBar key={t.month} label={t.month} value={t.total} maxValue={expenseMax} color="bg-red-500" index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No expense data yet</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Profit Trend" subtitle="Net profit/loss over time" loading={loading} action={<DollarSign className="h-4 w-4 text-emerald-400" />}>
          {trends && trends.profit.length > 0 ? (
            <div className="space-y-1.5">
              {trends.profit.slice(-6).map((t, i) => (
                <TrendBar key={t.month} label={t.month} value={Math.abs(t.total)} maxValue={profitMax} color={t.total >= 0 ? 'bg-emerald-500' : 'bg-red-500'} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No profit data yet</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Cash Flow Trend" subtitle="Inflows vs outflows over time" loading={loading} action={<Activity className="h-4 w-4 text-blue-400" />}>
          {trends && trends.cash_flow.length > 0 ? (
            <div className="space-y-2">
              {trends.cash_flow.slice(-6).map((c, i) => (
                <motion.div
                  key={c.month}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-white/[0.03]"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-secondary-400">{c.month}</span>
                    <span className={`text-xs font-mono tabular-nums ${(c.inflows - c.outflows) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(c.inflows - c.outflows) >= 0 ? '+' : ''}{Math.round(c.inflows - c.outflows).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex h-5 gap-0.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cashFlowMax > 0 ? (c.inflows / cashFlowMax) * 50 : 0}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="h-full bg-emerald-500 transition-all duration-300 hover:opacity-80"
                      title={`Inflows: ₹${Math.round(c.inflows).toLocaleString('en-IN')}`}
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cashFlowMax > 0 ? (c.outflows / cashFlowMax) * 50 : 0}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="h-full bg-red-500 transition-all duration-300 hover:opacity-80"
                      title={`Outflows: ₹${Math.round(c.outflows).toLocaleString('en-IN')}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No cash flow data yet</p></div>
          )}
        </ChartCard>
      </motion.div>
    </div>
  );
}
