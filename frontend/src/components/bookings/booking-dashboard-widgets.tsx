import { motion } from 'framer-motion';
import { useBookingDashboard } from '@/hooks/use-booking-dashboard';
import { MetricCard } from '@/components/shared/metric-card';
import { ChartCard } from '@/components/shared/chart-card';
import { IndianRupee, CalendarCheck, TrendingUp, Building2 } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function BookingDashboardWidgets() {
  const { metrics, loading, error, refresh } = useBookingDashboard();

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-red-400">Failed to load dashboard metrics</p>
        <button onClick={refresh} className="mt-2 text-xs text-accent-500 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <MetricCard
            icon={<IndianRupee className="h-5 w-5" />}
            label="Today's Revenue"
            value={metrics ? `₹${metrics.todays_revenue.toLocaleString('en-IN')}` : '₹0'}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={item}>
          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Monthly Revenue"
            value={metrics ? `₹${metrics.monthly_revenue.toLocaleString('en-IN')}` : '₹0'}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={item}>
          <MetricCard
            icon={<CalendarCheck className="h-5 w-5" />}
            label="Active Bookings"
            value={metrics?.latest_bookings?.length ? String(metrics.latest_bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length) : '0'}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={item}>
          <MetricCard
            icon={<Building2 className="h-5 w-5" />}
            label="Platforms Active"
            value={metrics?.revenue_by_platform?.length ? String(metrics.revenue_by_platform.length) : '0'}
            loading={loading}
          />
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <ChartCard title="Revenue by Platform" loading={loading}>
            {metrics?.revenue_by_platform && metrics.revenue_by_platform.length > 0 ? (
              <div className="space-y-3">
                {metrics.revenue_by_platform.map((p) => (
                  <div key={p.platform_id} className="flex items-center justify-between">
                    <span className="text-sm text-secondary-300">{p.platform_name}</span>
                    <span className="text-sm font-medium text-white">₹{p.total.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-secondary-500">No platform data yet</p>
              </div>
            )}
          </ChartCard>
        </motion.div>
        <motion.div variants={item}>
          <ChartCard title="Revenue by Vehicle" loading={loading}>
            {metrics?.revenue_by_vehicle && metrics.revenue_by_vehicle.length > 0 ? (
              <div className="space-y-3">
                {metrics.revenue_by_vehicle.slice(0, 5).map((v) => (
                  <div key={v.vehicle_id} className="flex items-center justify-between">
                    <span className="text-sm text-secondary-300">{v.vehicle_number}</span>
                    <span className="text-sm font-medium text-white">₹{v.total.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-secondary-500">No vehicle data yet</p>
              </div>
            )}
          </ChartCard>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <ChartCard title="Latest Bookings" loading={loading}>
          {metrics?.latest_bookings && metrics.latest_bookings.length > 0 ? (
            <div className="space-y-2">
              {metrics.latest_bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg bg-surface-light p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{b.booking_id}</p>
                    <p className="text-xs text-secondary-400">{b.vehicle_number} &bull; {b.platform_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-400">₹{b.net_revenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-secondary-500">{b.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-secondary-500">No bookings yet</p>
            </div>
          )}
        </ChartCard>
      </motion.div>
    </motion.div>
  );
}
