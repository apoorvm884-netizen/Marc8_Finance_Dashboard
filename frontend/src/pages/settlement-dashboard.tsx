import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee, Clock, BadgeCheck, TrendingUp, Users, Building2,
  Wallet, BarChart3, RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { settlementService } from '@/services/settlement.service';
import type { SettlementDashboardMetrics } from '@/types/settlement';

function formatCurrency(amount: number): string {
  return '\u20b9' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export default function SettlementDashboardPage() {
  const [metrics, setMetrics] = useState<SettlementDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const result = await settlementService.getDashboardMetrics();
      setMetrics(result.data);
    } catch (err) {
      console.error('Failed to load settlement dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader title="Settlement Dashboard" description="Loading settlement metrics..." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton variant="card" className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Settlement Dashboard"
        description="Executive overview of settlements, payouts, and revenue distribution"
        actions={
          <Button variant="outline" size="sm" icon={<RefreshCw />} onClick={fetchMetrics}>
            Refresh
          </Button>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Settlement Due"
            value={formatCurrency(metrics?.settlement_due_amount || 0)}
            icon={<Clock className="h-4 w-4" />}
            semantic="orange"
          />
          <MetricCard
            label="Settlement Paid"
            value={formatCurrency(metrics?.settlement_paid_amount || 0)}
            icon={<BadgeCheck className="h-4 w-4" />}
            semantic="green"
          />
          <MetricCard
            label="Pending Approvals"
            value={String(metrics?.pending_approvals || 0)}
            icon={<Clock className="h-4 w-4" />}
            semantic="orange"
          />
          <MetricCard
            label="Upcoming Payouts"
            value={formatCurrency(metrics?.upcoming_payouts || 0)}
            icon={<TrendingUp className="h-4 w-4" />}
            semantic="blue"
          />
          <MetricCard
            label="Owner Liability"
            value={formatCurrency(metrics?.owner_liability || 0)}
            icon={<Users className="h-4 w-4" />}
            semantic="red"
          />
          <MetricCard
            label="Platform Liability"
            value={formatCurrency(metrics?.platform_liability || 0)}
            icon={<Building2 className="h-4 w-4" />}
            semantic="blue"
          />
          <MetricCard
            label="Cash Requirement"
            value={formatCurrency(metrics?.cash_requirement || 0)}
            icon={<Wallet className="h-4 w-4" />}
            semantic="red"
          />
          <MetricCard
            label="Total Settlements"
            value={String(metrics?.total_settlements || 0)}
            icon={<BarChart3 className="h-4 w-4" />}
            semantic="neutral"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-accent-500" />
                Monthly Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!metrics?.monthly_distribution || metrics.monthly_distribution.length === 0 ? (
                <p className="text-sm text-secondary-500">No settlement data available yet.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.monthly_distribution.slice(-6).map((item) => (
                    <div key={item.month} className="flex items-center justify-between rounded-lg bg-secondary-800/30 p-3">
                      <span className="text-sm text-secondary-300">{item.month}</span>
                      <span className="font-medium text-white">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent-500" />
                Top Owners by Settlement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!metrics?.top_owners || metrics.top_owners.length === 0 ? (
                <p className="text-sm text-secondary-500">No owner settlements yet.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.top_owners.slice(0, 5).map((owner, i) => (
                    <div key={owner.owner_id} className="flex items-center justify-between rounded-lg bg-secondary-800/30 p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500/20 text-xs font-bold text-accent-500">
                          {i + 1}
                        </span>
                        <span className="text-sm text-white">{owner.owner_name}</span>
                      </div>
                      <span className="font-medium text-white">{formatCurrency(owner.total_amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent-500" />
                Distribution Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!metrics?.distribution_trends || metrics.distribution_trends.length === 0 ? (
                <p className="text-sm text-secondary-500">No trend data available yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-secondary-400 font-medium">Month</th>
                        <th className="text-right py-2 text-secondary-400 font-medium">Owner Share</th>
                        <th className="text-right py-2 text-secondary-400 font-medium">Marc8 Share</th>
                        <th className="text-right py-2 text-secondary-400 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.distribution_trends.map((item) => (
                        <tr key={item.month} className="border-b border-border/50">
                          <td className="py-2 text-secondary-300">{item.month}</td>
                          <td className="py-2 text-right font-medium text-emerald-400">
                            {formatCurrency(item.owner_share)}
                          </td>
                          <td className="py-2 text-right font-medium text-blue-400">
                            {formatCurrency(item.marc8_share)}
                          </td>
                          <td className="py-2 text-right font-medium text-white">
                            {formatCurrency(item.owner_share + item.marc8_share)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
