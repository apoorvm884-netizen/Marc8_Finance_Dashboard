import { motion } from 'framer-motion';
import { MetricCard } from '@/components/shared/metric-card';
import { Skeleton } from '@/components/ui/skeleton';
import { IndianRupee, Calendar, AlertTriangle, TrendingUp, Clock, ArrowUpRight, CalendarDays } from 'lucide-react';
import type { PaymentPlannerData, CashRequirementForecast } from '@/types/outstanding';

interface PaymentPlannerWidgetProps {
  paymentData: PaymentPlannerData | null;
  cashData: CashRequirementForecast | null;
  loading: boolean;
}

export function DashboardPaymentPlanner({ paymentData, cashData, loading }: PaymentPlannerWidgetProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl bg-surface-light" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Payment Planner</h3>
        <p className="text-sm text-secondary-400">Track upcoming payments and liabilities</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Total Outstanding"
          value={paymentData ? `₹${paymentData.total_outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0'}
          subtitle={paymentData ? `${paymentData.upcoming_payments} upcoming payments` : undefined}
        />
        <MetricCard
          icon={<Calendar className="h-5 w-5 text-amber-500" />}
          label="Due Today"
          value={paymentData ? `₹${paymentData.due_today.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0'}
          subtitle={paymentData && paymentData.due_today > 0 ? 'Requires attention' : undefined}
        />
        <MetricCard
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          label="Due This Week"
          value={paymentData ? `₹${paymentData.due_this_week.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0'}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          label="Due This Month"
          value={paymentData ? `₹${paymentData.due_this_month.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0'}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          label="Overdue"
          value={paymentData ? `₹${paymentData.overdue_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0'}
          subtitle={paymentData && paymentData.overdue_amount > 0 ? 'Requires immediate attention' : undefined}
        />
        <MetricCard
          icon={<ArrowUpRight className="h-5 w-5 text-purple-500" />}
          label="Largest Liability"
          value={paymentData?.largest_liability ? `₹${paymentData.largest_liability.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'None'}
          subtitle={paymentData?.largest_liability?.title}
        />
        <MetricCard
          icon={<Calendar className="h-5 w-5 text-orange-500" />}
          label="Cash Required (7 days)"
          value={cashData ? `₹${cashData.next_7_days.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0'}
        />
        <MetricCard
          icon={<CalendarDays className="h-5 w-5 text-orange-500" />}
          label="Cash Required (30 days)"
          value={cashData ? `₹${cashData.next_30_days.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0'}
        />
      </div>
    </motion.div>
  );
}
