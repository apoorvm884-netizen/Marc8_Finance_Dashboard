import { motion } from 'framer-motion';
import { ChartCard } from '@/components/shared/chart-card';
import { Clock, FileText, Truck, TrendingDown, IndianRupee, AlertTriangle } from 'lucide-react';
import type { Alerts } from '@/types/dashboard';

interface Props {
  alerts: Alerts | null;
  loading: boolean;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function AlertBadge({ icon, label, count, color, delay }: { icon: React.ReactNode; label: string; count: number; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: delay ?? 0 }}
      className={`flex items-center gap-3 rounded-xl border ${color} bg-surface-light/50 px-4 py-3 transition-all duration-200 hover:bg-surface-light hover:scale-[1.01]`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.replace('border', 'bg').replace('-500/30', '-500/10')}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-secondary-300">{label}</p>
      </div>
      <span className={`text-lg font-bold tabular-nums ${color.replace('border-', 'text-')}`}>{count}</span>
    </motion.div>
  );
}

export function DashboardAlerts({ alerts, loading }: Props) {
  return (
    <motion.div variants={item}>
      <ChartCard title="Alerts & Warnings" subtitle="Items requiring your attention" loading={loading} action={<AlertTriangle className="h-4 w-4 text-amber-400" />}>
        {alerts ? (
          <div className="space-y-3">
            <AlertBadge
              icon={<Truck className="h-5 w-5 text-amber-400" />}
              label="Vehicles without Bookings"
              count={alerts.vehicles_without_bookings}
              color="border-amber-500/30"
              delay={0}
            />
            <AlertBadge
              icon={<TrendingDown className="h-5 w-5 text-red-400" />}
              label="Negative Profit Vehicles"
              count={alerts.negative_profit_vehicles.length}
              color="border-red-500/30"
              delay={0.05}
            />
            <AlertBadge
              icon={<Clock className="h-5 w-5 text-yellow-400" />}
              label="Pending Journal Entries"
              count={alerts.pending_journal_entries}
              color="border-yellow-500/30"
              delay={0.1}
            />
            <AlertBadge
              icon={<FileText className="h-5 w-5 text-orange-400" />}
              label="Pending Expenses"
              count={alerts.pending_expenses}
              color="border-orange-500/30"
              delay={0.15}
            />
            {alerts.large_expenses && alerts.large_expenses.length > 0 && (
              <AlertBadge
                icon={<IndianRupee className="h-5 w-5 text-red-400" />}
                label="Large Expenses"
                count={alerts.large_expenses.length}
                color="border-red-500/30"
                delay={0.2}
              />
            )}
            {alerts.high_expense_vehicles.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 border-t border-border pt-3"
              >
                <p className="mb-2 text-xs font-medium text-secondary-400">High Expense Vehicles</p>
                <div className="space-y-1.5">
                  {alerts.high_expense_vehicles.slice(0, 3).map((v, i) => (
                    <motion.div
                      key={v.vehicle_id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.05 }}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-light transition-all hover:bg-surface-light/80"
                    >
                      <span className="text-sm text-secondary-300">{v.vehicle_number}</span>
                      <span className="text-xs text-red-400 font-mono tabular-nums">₹{Math.round(v.total_expense ?? 0).toLocaleString('en-IN')}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">Loading alerts...</p></div>
        )}
      </ChartCard>
    </motion.div>
  );
}
