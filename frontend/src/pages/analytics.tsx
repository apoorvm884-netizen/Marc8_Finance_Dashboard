import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { analyticsService } from '@/services/analytics.service';
import { PageHeader } from '@/components/shared/page-header';
import { ChartCard } from '@/components/shared/chart-card';
import { MetricCard } from '@/components/shared/metric-card';
import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw, Percent } from 'lucide-react';
import type { CombinedAnalytics } from '@/types/analytics';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-cyan-500', 'bg-rose-500', 'bg-indigo-500', 'bg-orange-500'];

function TrendBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs text-secondary-400 shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-surface-light rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-24 text-right text-xs text-white font-mono">
        ₹{Math.round(value).toLocaleString('en-IN')}
      </span>
    </div>
  );
}

function PieBar({ label, value, total, index, prefix }: { label: string; value: number; total: number; index: number; prefix?: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const color = COLORS[index % COLORS.length];
  return (
    <div className="flex items-center gap-3">
      <div className={`h-3 w-3 rounded-full shrink-0 ${color}`} />
      <span className="flex-1 text-sm text-secondary-300 truncate">{label}</span>
      <div className="flex-1 h-4 bg-surface-light rounded-full overflow-hidden max-w-[120px]">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-24 text-right text-xs text-white font-mono">
        {prefix || '₹'}{Math.round(value).toLocaleString('en-IN')}
      </span>
      <span className="w-10 text-right text-xs text-secondary-500">{Math.round(pct)}%</span>
    </div>
  );
}

function RankItem({ rank, label, value, valueColor, suffix }: { rank: number; label: string; value: number; valueColor: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface-light px-3 py-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500/10 text-xs font-bold text-accent-400">
        {rank}
      </span>
      <span className="flex-1 text-sm text-secondary-300 truncate">{label}</span>
      <span className={`text-sm font-medium font-mono ${valueColor}`}>
        {suffix || '₹'}{Math.round(value).toLocaleString('en-IN')}
      </span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<CombinedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getCombined();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const revenueMax = data?.revenue?.trend ? Math.max(...data.revenue.trend.map(t => t.total), 1) : 1;
  const expenseMax = data?.expense?.trend ? Math.max(...data.expense.trend.map(t => t.total), 1) : 1;
  return (
    <div className="page-container">
      <PageHeader
        title="Analytics"
        description="In-depth financial and operational analytics"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        }
      />

      {error ? (
        <ErrorState title="Failed to load analytics" message={error} retry={{ onClick: fetchData }} />
      ) : (
        <motion.div initial="hidden" animate="show" className="space-y-6">
          {/* Growth KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={<TrendingUp className="h-5 w-5 text-emerald-400" />} label="Monthly Growth" value={data ? `${data.growth?.monthly_growth ?? 0}%` : '0%'} loading={loading} />
            <MetricCard icon={<TrendingUp className="h-5 w-5 text-blue-400" />} label="Quarterly Growth" value={data ? `${data.growth?.quarterly_growth ?? 0}%` : '0%'} loading={loading} />
            <MetricCard icon={<TrendingUp className="h-5 w-5 text-violet-400" />} label="Yearly Growth" value={data ? `${data.growth?.yearly_growth ?? 0}%` : '0%'} loading={loading} />
            <MetricCard icon={<Percent className="h-5 w-5 text-emerald-400" />} label="Net Margin" value={data ? `${data.profit?.net_margin ?? 0}%` : '0%'} loading={loading} />
          </div>

          {/* Revenue Trends */}
          <motion.div variants={item}>
            <ChartCard title="Revenue Trends (12 Months)" loading={loading}>
              {data?.revenue?.trend && data.revenue.trend.length > 0 ? (
                <div className="space-y-2">
                  {data.revenue.trend.slice(-6).map((t) => (
                    <TrendBar key={t.month} label={t.month} value={t.total} maxValue={revenueMax} color="bg-emerald-500" />
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No revenue data</p></div>
              )}
            </ChartCard>
          </motion.div>

          {/* Expense Trends */}
          <motion.div variants={item}>
            <ChartCard title="Expense Trends (12 Months)" loading={loading}>
              {data?.expense?.trend && data.expense.trend.length > 0 ? (
                <div className="space-y-2">
                  {data.expense.trend.slice(-6).map((t) => (
                    <TrendBar key={t.month} label={t.month} value={t.total} maxValue={expenseMax} color="bg-red-500" />
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No expense data</p></div>
              )}
            </ChartCard>
          </motion.div>

          {/* Profit vs Revenue vs Expense comparison */}
          <motion.div variants={item}>
            <ChartCard title="Revenue vs Expense vs Profit" loading={loading}>
              {data?.revenue_vs_expense_vs_profit && data.revenue_vs_expense_vs_profit.length > 0 ? (
                <div className="space-y-3">
                  {data.revenue_vs_expense_vs_profit.slice(-6).map((m) => (
                    <div key={m.month} className="space-y-1">
                      <span className="text-xs text-secondary-400">{m.month}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-0.5">
                          <div className="h-4 rounded-l-full bg-emerald-500 transition-all" style={{ width: `${Math.min((m.revenue / Math.max(m.revenue, m.expense, 1)) * 100, 100)}%` }} />
                          <div className="h-4 bg-red-500 transition-all" style={{ width: `${Math.min((m.expense / Math.max(m.revenue, m.expense, 1)) * 100, 100)}%` }} />
                          <div className="h-4 rounded-r-full bg-blue-500 transition-all" style={{ width: `${Math.min((Math.abs(m.profit) / Math.max(m.revenue, m.expense, 1)) * 100, 100)}%` }} />
                        </div>
                        <span className="w-16 text-right text-xs text-white font-mono">₹{Math.round(m.revenue - m.expense).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No comparison data</p></div>
              )}
            </ChartCard>
          </motion.div>

          {/* Vehicle Performance */}
          <div className="grid gap-6 sm:grid-cols-2">
            <motion.div variants={item}>
              <ChartCard title="Top Performing Vehicles" loading={loading}>
                {data?.vehicle_performance?.top_performing && data.vehicle_performance.top_performing.length > 0 ? (
                  <div className="space-y-2">
                    {data.vehicle_performance.top_performing.slice(0, 5).map((v, i) => (
                      <RankItem key={v.vehicle_id} rank={i + 1} label={v.vehicle_number} value={v.total_revenue} valueColor="text-emerald-400" />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No data</p></div>
                )}
              </ChartCard>
            </motion.div>
            <motion.div variants={item}>
              <ChartCard title="Lowest Performing Vehicles" loading={loading}>
                {data?.vehicle_performance?.lowest_performing && data.vehicle_performance.lowest_performing.length > 0 ? (
                  <div className="space-y-2">
                    {data.vehicle_performance.lowest_performing.map((v, i) => (
                      <RankItem key={v.vehicle_id} rank={i + 1} label={v.vehicle_number} value={v.total_revenue} valueColor="text-red-400" />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No data</p></div>
                )}
              </ChartCard>
            </motion.div>
          </div>

          {/* Platform Comparison */}
          <motion.div variants={item}>
            <ChartCard title="Platform Comparison" loading={loading}>
              {data?.platform_comparison && data.platform_comparison.length > 0 ? (
                <div className="space-y-3">
                  {data.platform_comparison.map((p) => (
                    <div key={p.platform_name} className="flex items-center justify-between rounded-lg bg-surface-light p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{p.platform_name}</p>
                        <p className="text-xs text-secondary-400">{p.booking_count} bookings</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-emerald-400">₹{Math.round(p.revenue).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-secondary-500">Commission: ₹{Math.round(p.commission).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No platform data</p></div>
              )}
            </ChartCard>
          </motion.div>

          {/* Expense Category Breakdown */}
          <motion.div variants={item}>
            <ChartCard title="Expense Category Breakdown" loading={loading}>
              {data?.expense?.by_category && data.expense.by_category.length > 0 ? (
                <div className="space-y-2">
                  {data.expense.by_category.map((c, i) => (
                    <PieBar key={c.category_id} label={c.category_name} value={c.total} total={data.expense.by_category.reduce((s, c) => s + c.total, 0)} index={i} />
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No expense data</p></div>
              )}
            </ChartCard>
          </motion.div>

          {/* Cash Flow Trend */}
          <motion.div variants={item}>
            <ChartCard title="Cash Flow Trend" loading={loading}>
              {data?.cash_flow && data.cash_flow.length > 0 ? (
                <div className="space-y-2">
                  {data.cash_flow.slice(-6).map((c) => {
                    const maxVal = Math.max(...data.cash_flow.flatMap(cf => [cf.inflow, cf.outflow]), 1);
                    return (
                      <div key={c.month} className="space-y-1">
                        <span className="text-xs text-secondary-400">{c.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex gap-0.5">
                            <div className="h-4 rounded-l-full bg-emerald-500 transition-all" style={{ width: `${(c.inflow / maxVal) * 50}%` }} />
                            <div className="h-4 rounded-r-full bg-red-500 transition-all" style={{ width: `${(c.outflow / maxVal) * 50}%` }} />
                          </div>
                          <span className={`w-20 text-right text-xs font-mono ${c.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {c.net >= 0 ? '+' : ''}{Math.round(c.net).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No cash flow data</p></div>
              )}
            </ChartCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
