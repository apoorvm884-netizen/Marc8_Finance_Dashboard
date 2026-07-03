import { motion } from 'framer-motion';
import { ChartCard } from '@/components/shared/chart-card';
import { Badge } from '@/components/ui/badge';
import type { RecentActivity } from '@/types/dashboard';
import { CalendarCheck, BookOpen, Receipt } from 'lucide-react';

interface Props {
  recent: RecentActivity | null;
  loading: boolean;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const bookingStatusColors: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
  PENDING: 'warning', CONFIRMED: 'info', COMPLETED: 'success', CANCELLED: 'destructive',
};

const journalStatusColors: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
  PENDING: 'warning', COMPLETED: 'success', CANCELLED: 'destructive',
};

const expenseStatusColors: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
  PENDING: 'warning', APPROVED: 'success', REJECTED: 'destructive', REIMBURSED: 'info',
};

function ActivityItem({ children, delay }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: delay ?? 0 }}
      className="flex items-center justify-between rounded-xl bg-surface-light/50 px-3 py-2.5 transition-all duration-200 hover:bg-surface-light hover:scale-[1.01]"
    >
      {children}
    </motion.div>
  );
}

export function DashboardRecentActivity({ recent, loading }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <motion.div variants={item}>
        <ChartCard title="Latest Bookings" subtitle="Recent fleet bookings" loading={loading} action={<CalendarCheck className="h-4 w-4 text-emerald-400" />}>
          {recent && recent.latest_bookings.length > 0 ? (
            <div className="space-y-2">
              {recent.latest_bookings.map((b, i) => (
                <ActivityItem key={b.id} delay={i * 0.04}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{b.booking_id}</p>
                    <p className="text-xs text-secondary-400 truncate">
                      {b.vehicle_number || '-'} &bull; {b.platform_name || '-'}
                    </p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-sm font-medium text-emerald-400 tabular-nums">
                      ₹{b.net_revenue.toLocaleString('en-IN')}
                    </p>
                    <Badge variant={bookingStatusColors[b.status] ?? 'default'} size="sm">
                      {b.status}
                    </Badge>
                  </div>
                </ActivityItem>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No bookings yet</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Latest Journal Entries" subtitle="Recent revenue entries" loading={loading} action={<BookOpen className="h-4 w-4 text-blue-400" />}>
          {recent && recent.latest_journal_entries.length > 0 ? (
            <div className="space-y-2">
              {recent.latest_journal_entries.map((e, i) => (
                <ActivityItem key={e.id} delay={i * 0.04}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{e.vehicle_number || '-'}</p>
                    <p className="text-xs text-secondary-400 truncate">{e.category_name || '-'}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-sm font-medium text-blue-400 tabular-nums">
                      ₹{e.amount_collected.toLocaleString('en-IN')}
                    </p>
                    <Badge variant={journalStatusColors[e.status] ?? 'default'} size="sm">
                      {e.status}
                    </Badge>
                  </div>
                </ActivityItem>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No entries yet</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Latest Expenses" subtitle="Recent expense entries" loading={loading} action={<Receipt className="h-4 w-4 text-red-400" />}>
          {recent && recent.latest_expenses.length > 0 ? (
            <div className="space-y-2">
              {recent.latest_expenses.map((e, i) => (
                <ActivityItem key={e.id} delay={i * 0.04}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{e.category_name || '-'}</p>
                    <p className="text-xs text-secondary-400 truncate">
                      {e.vehicle_number || 'No vehicle'} &bull; {e.vendor || '-'}
                    </p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-sm font-medium text-red-400 tabular-nums">
                      ₹{e.amount.toLocaleString('en-IN')}
                    </p>
                    <Badge variant={expenseStatusColors[e.status] ?? 'default'} size="sm">
                      {e.status}
                    </Badge>
                  </div>
                </ActivityItem>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No expenses yet</p></div>
          )}
        </ChartCard>
      </motion.div>
    </div>
  );
}
