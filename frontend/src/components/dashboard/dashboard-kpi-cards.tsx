import { MetricCard } from '@/components/shared/metric-card';
import {
  IndianRupee, TrendingUp, TrendingDown, Wallet, Truck,
  CalendarCheck, Wrench, Percent, PiggyBank, Receipt,
  Activity, AlertTriangle, Gauge, Ban
} from 'lucide-react';
import type { KPIs, FleetHealthSummary } from '@/types/dashboard';

interface Props {
  kpis: KPIs | null;
  fleetHealth?: FleetHealthSummary | null;
  loading: boolean;
}

function formatCurrency(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function DashboardKPICards({ kpis, fleetHealth, loading }: Props) {
  return (
    <div className="space-y-8">
      {/* Financial Health */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          Financial Health
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<IndianRupee className="h-4 w-4" />}
            iconBg="green"
            label="Net Profit"
            value={formatCurrency(kpis?.net_profit ?? 0)}
            trend={((kpis?.net_profit ?? 0) >= 0) ? 'up' : 'down'}
            subtitle="Overall profitability"
            loading={loading}
            semantic="green"
          />
          <MetricCard
            icon={<TrendingUp className="h-4 w-4" />}
            iconBg="green"
            label="Monthly Revenue"
            value={formatCurrency(kpis?.monthly_revenue ?? 0)}
            subtitle={`Today: ${formatCurrency(kpis?.todays_revenue ?? 0)}`}
            loading={loading}
            semantic="green"
          />
          <MetricCard
            icon={<TrendingDown className="h-4 w-4" />}
            iconBg="red"
            label="Monthly Expense"
            value={formatCurrency(kpis?.monthly_expense ?? 0)}
            subtitle={`Today: ${formatCurrency(kpis?.todays_expense ?? 0)}`}
            loading={loading}
            semantic="red"
          />
          <MetricCard
            icon={<Percent className="h-4 w-4" />}
            iconBg="blue"
            label="Net Margin"
            value={`${kpis?.net_margin ?? 0}%`}
            subtitle="Profitability ratio"
            loading={loading}
            semantic="blue"
          />
        </div>
      </div>

      {/* Fleet Overview */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">
          <Truck className="h-3.5 w-3.5 text-amber-400" />
          Fleet Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<Truck className="h-4 w-4" />}
            iconBg="green"
            label="Active Vehicles"
            value={String(kpis?.active_vehicles ?? 0)}
            subtitle={`${kpis?.available_vehicles ?? 0} ready for booking`}
            loading={loading}
            semantic="green"
          />
          <MetricCard
            icon={<CalendarCheck className="h-4 w-4" />}
            iconBg="blue"
            label="Booked"
            value={String(kpis?.booked_vehicles ?? 0)}
            subtitle={`${kpis?.utilization_rate ?? 0}% utilization`}
            loading={loading}
            semantic="blue"
          />
          <MetricCard
            icon={<Wrench className="h-4 w-4" />}
            iconBg="orange"
            label="In Maintenance"
            value={String(kpis?.maintenance_vehicles ?? 0)}
            subtitle={fleetHealth ? `${fleetHealth.vehicles_in_maintenance} total` : undefined}
            loading={loading}
            semantic="orange"
          />
          <MetricCard
            icon={<PiggyBank className="h-4 w-4" />}
            iconBg="green"
            label="Avg Rev/Vehicle"
            value={formatCurrency(kpis?.avg_revenue_per_vehicle ?? 0)}
            subtitle={`Avg Exp: ${formatCurrency(kpis?.avg_expense_per_vehicle ?? 0)}`}
            loading={loading}
            semantic="green"
          />
        </div>
      </div>

      {/* Outstanding & Cash */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">
          <Receipt className="h-3.5 w-3.5 text-blue-400" />
          Outstanding & Cash
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={<Receipt className="h-4 w-4" />}
            iconBg="blue"
            label="Outstanding Collections"
            value={formatCurrency(kpis?.outstanding_collections ?? 0)}
            subtitle="Pending collections"
            loading={loading}
            semantic="blue"
          />
          <MetricCard
            icon={<Wallet className="h-4 w-4" />}
            iconBg="green"
            label="Monthly Profit"
            value={formatCurrency(kpis?.monthly_profit ?? 0)}
            subtitle={`Yearly: ${formatCurrency(kpis?.yearly_profit ?? 0)}`}
            loading={loading}
            semantic="green"
          />
          <MetricCard
            icon={<Activity className="h-4 w-4" />}
            iconBg="blue"
            label="Cash Flow"
            value={formatCurrency(kpis?.cash_flow ?? 0)}
            trend={(kpis?.cash_flow ?? 0) >= 0 ? 'up' : 'down'}
            loading={loading}
            semantic="blue"
          />
        </div>
      </div>

      {/* Documents & Compliance */}
      {fleetHealth && (
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
            Documents & Compliance
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={<Ban className="h-4 w-4" />}
              iconBg="red"
              label="Expired Documents"
              value={String(fleetHealth.expired_documents)}
              subtitle="Requires immediate attention"
              loading={loading}
              semantic="red"
            />
            <MetricCard
              icon={<CalendarCheck className="h-4 w-4" />}
              iconBg="orange"
              label="Insurance Due"
              value={String(fleetHealth.insurance_due)}
              subtitle="Next 30 days"
              loading={loading}
              semantic="orange"
            />
            <MetricCard
              icon={<Gauge className="h-4 w-4" />}
              iconBg="orange"
              label="Fitness Due"
              value={String(fleetHealth.fitness_due)}
              subtitle="Next 30 days"
              loading={loading}
              semantic="orange"
            />
            <MetricCard
              icon={<AlertTriangle className="h-4 w-4" />}
              iconBg="blue"
              label="Health Score"
              value={`${fleetHealth.health_score}%`}
              trend={fleetHealth.health_score >= 70 ? 'up' : fleetHealth.health_score >= 40 ? 'neutral' : 'down'}
              loading={loading}
              semantic={fleetHealth.health_score >= 70 ? 'green' : fleetHealth.health_score >= 40 ? 'orange' : 'red'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
