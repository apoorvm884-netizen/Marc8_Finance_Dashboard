import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useDashboard } from '@/hooks/use-dashboard';
import { DashboardKPICards } from '@/components/dashboard/dashboard-kpi-cards';
import { DashboardTrendCharts } from '@/components/dashboard/dashboard-trend-charts';
import { DashboardBreakdownCharts } from '@/components/dashboard/dashboard-breakdown-charts';
import { DashboardRecentActivity } from '@/components/dashboard/dashboard-recent-activity';
import { DashboardTopVehicles } from '@/components/dashboard/dashboard-top-vehicles';
import { DashboardAlerts } from '@/components/dashboard/dashboard-alerts';
import { DashboardGlobalFilters, type FilterState } from '@/components/dashboard/dashboard-global-filters';
import { DashboardFleetHealthSection } from '@/components/dashboard/dashboard-fleet-health-section';
import { ErrorState } from '@/components/shared/error-state';
import type { KPIs, FleetHealthSummary } from '@/types/dashboard';
import { Activity, TrendingUp, PieChart, Truck, AlertTriangle, Clock, Award, Filter } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const section = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function SectionWrapper({ children, icon, title }: { children: React.ReactNode; icon: React.ReactNode; title: string }) {
  return (
    <motion.div
      variants={section}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 px-1">
        {icon}
        <h2 className="dashboard-section-title">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    date_from: '',
    date_to: '',
    vehicle_id: '',
    platform_id: '',
    expense_category_id: '',
    payment_mode_id: '',
    journal_category_id: '',
  });

  const filterParams: Record<string, string | undefined> = {};
  if (filters.date_from) filterParams.date_from = filters.date_from;
  if (filters.date_to) filterParams.date_to = filters.date_to;
  if (filters.vehicle_id) filterParams.vehicle_id = filters.vehicle_id;
  if (filters.platform_id) filterParams.platform_id = filters.platform_id;
  if (filters.expense_category_id) filterParams.expense_category_id = filters.expense_category_id;
  if (filters.payment_mode_id) filterParams.payment_mode_id = filters.payment_mode_id;
  if (filters.journal_category_id) filterParams.journal_category_id = filters.journal_category_id;

  const { data, loading, error, refresh } = useDashboard(filterParams);
  const kpis: KPIs | null = data?.kpis ?? null;
  const fleetHealth: FleetHealthSummary | null = data?.fleet_health ?? null;

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User'}
            </h1>
            <p className="mt-1 text-sm text-secondary-400">Fleet Financial Command Center</p>
          </div>
        </div>
      </motion.div>

      {/* Global Filters */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-3.5 w-3.5 text-secondary-400" />
          <span className="text-xs font-medium text-secondary-400 uppercase tracking-wider">Filters</span>
        </div>
        <DashboardGlobalFilters
          filters={filters}
          onChange={setFilters}
          onRefresh={refresh}
          loading={loading}
        />
      </motion.div>

      {error ? (
        <ErrorState
          title="Failed to load dashboard"
          message={error}
          retry={{ onClick: refresh }}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {/* 1. Business Health */}
          <SectionWrapper icon={<Activity className="h-4 w-4 text-emerald-400" />} title="Business Health">
            <DashboardKPICards kpis={kpis} fleetHealth={fleetHealth} loading={loading} />
          </SectionWrapper>

          {/* 2. Financial Trends */}
          <SectionWrapper icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} title="Financial Trends">
            <DashboardTrendCharts trends={data?.trends ?? null} loading={loading} />
          </SectionWrapper>

          {/* 3. Fleet Health */}
          <SectionWrapper icon={<Truck className="h-4 w-4 text-amber-400" />} title="Fleet Health">
            <DashboardFleetHealthSection fleetHealth={fleetHealth} loading={loading} />
          </SectionWrapper>

          {/* 4. Breakdowns */}
          <SectionWrapper icon={<PieChart className="h-4 w-4 text-blue-400" />} title="Revenue & Expense Breakdown">
            <DashboardBreakdownCharts breakdowns={data?.breakdowns ?? null} loading={loading} />
          </SectionWrapper>

          {/* 5. Vehicle Performance */}
          <SectionWrapper icon={<Award className="h-4 w-4 text-amber-400" />} title="Vehicle Performance">
            <DashboardTopVehicles topVehicles={data?.top_vehicles ?? null} loading={loading} />
          </SectionWrapper>

          {/* 6. Alerts */}
          <SectionWrapper icon={<AlertTriangle className="h-4 w-4 text-red-400" />} title="Alerts & Warnings">
            <DashboardAlerts alerts={data?.alerts ?? null} loading={loading} />
          </SectionWrapper>

          {/* 7. Recent Activity */}
          <SectionWrapper icon={<Clock className="h-4 w-4 text-blue-400" />} title="Recent Activity">
            <DashboardRecentActivity recent={data?.recent ?? null} loading={loading} />
          </SectionWrapper>
        </motion.div>
      )}
    </div>
  );
}
