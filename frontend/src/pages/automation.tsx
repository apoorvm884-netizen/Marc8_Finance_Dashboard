import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Activity, AlertTriangle, CheckCircle2, XCircle, Clock,
  Lightbulb, RefreshCw, Settings2, TrendingUp, ShieldAlert,
} from 'lucide-react';
import { automationService } from '@/services/automation.service';
import { intelligenceService } from '@/services/intelligence.service';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotification } from '@/hooks/use-notification';
import type { AutomationSummary, BusinessAlert, Recommendation } from '@/types/automation';

export default function AutomationPage() {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<AutomationSummary | null>(null);
  const [alerts, setAlerts] = useState<BusinessAlert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dueJobs, setDueJobs] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        automationService.getSummary(),
        intelligenceService.findAllAlerts({ is_dismissed: 'false', limit: '10' }),
        intelligenceService.findAllRecommendations({ status: 'open', limit: '10' }),
        automationService.findAllRules({}),
      ]);

      if (results[0].status === 'fulfilled') setSummary(results[0].value);
      if (results[1].status === 'fulfilled') setAlerts(results[1].value.data ?? []);
      if (results[2].status === 'fulfilled') setRecommendations(results[2].value.data ?? []);
      if (results[3].status === 'fulfilled') {
        const rules = results[3].value.data ?? [];
        setDueJobs(rules.filter(r => r.is_active && r.event_type).length);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerateInsights = async () => {
    setGenerating(true);
    try {
      const result = await intelligenceService.generateInsights();
      notify.success(`Generated ${result.alerts_created} alert(s) and ${result.recommendations_created} recommendation(s)`);
      fetchData();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  const handleActionRecommendation = async (id: string) => {
    try {
      await intelligenceService.actionRecommendation(id);
      notify.success('Recommendation marked as actioned');
      fetchData();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to action recommendation');
    }
  };

  const handleDismissRecommendation = async (id: string) => {
    try {
      await intelligenceService.dismissRecommendation(id);
      notify.success('Recommendation dismissed');
      fetchData();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to dismiss recommendation');
    }
  };

  const handleDismissAlert = async (id: string) => {
    try {
      await intelligenceService.dismissAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      notify.success('Alert dismissed');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to dismiss alert');
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Business Automation"
        description="Automation engine, business alerts, and executive recommendations"
        actions={
          <Button onClick={handleGenerateInsights} loading={generating}>
            <Zap className="mr-2 h-4 w-4" /> Generate Insights
          </Button>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<Activity className="h-4 w-4" />}
            iconBg="blue"
            label="Total Executions"
            value={summary ? String(summary.total) : '0'}
            subtitle="All automation runs"
            loading={loading}
          />
          <MetricCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            iconBg="green"
            label="Completed"
            value={summary ? String(summary.completed) : '0'}
            subtitle="Successful executions"
            loading={loading}
          />
          <MetricCard
            icon={<XCircle className="h-4 w-4" />}
            iconBg="red"
            label="Failed"
            value={summary ? String(summary.failed) : '0'}
            trend={summary && summary.failed > 0 ? 'down' : undefined}
            trendValue={summary && summary.failed > 0 ? `${summary.failed} failed` : undefined}
            subtitle="Failed executions"
            loading={loading}
          />
          <MetricCard
            icon={<AlertTriangle className="h-4 w-4" />}
            iconBg="orange"
            label="Active Alerts"
            value={String(alerts.filter(a => a.severity === 'critical' || a.severity === 'warning').length)}
            subtitle="Requiring attention"
            loading={loading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Business Alerts */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold text-white">Business Alerts</h3>
              </div>
              {alerts.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setRecommendations([])}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-light" />
                ))
              ) : alerts.length === 0 ? (
                <p className="text-sm text-secondary-400">No active alerts</p>
              ) : (
                alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface-light p-3">
                    <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500/10' :
                      alert.severity === 'warning' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                    }`}>
                      <AlertTriangle className={`h-3 w-3 ${
                        alert.severity === 'critical' ? 'text-red-400' :
                        alert.severity === 'warning' ? 'text-orange-400' : 'text-blue-400'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{alert.title}</span>
                        <Badge variant={severityColor(alert.severity) as 'destructive' | 'warning' | 'default'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      {alert.description && (
                        <p className="mt-0.5 text-xs text-secondary-400">{alert.description}</p>
                      )}
                      <p className="mt-0.5 text-xs text-secondary-500">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="text-xs text-secondary-500 hover:text-white transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold text-white">Executive Recommendations</h3>
            </div>
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-surface-light" />
                ))
              ) : recommendations.length === 0 ? (
                <p className="text-sm text-secondary-400">No recommendations yet. Click "Generate Insights" to create them.</p>
              ) : (
                recommendations.slice(0, 5).map((rec) => (
                  <div key={rec.id} className="rounded-lg border border-border bg-surface-light p-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{rec.title}</span>
                          <Badge variant={priorityColor(rec.priority) as 'destructive' | 'warning' | 'default' | 'secondary'}>
                            {rec.priority}
                          </Badge>
                        </div>
                        {rec.description && (
                          <p className="mt-0.5 text-xs text-secondary-400">{rec.description}</p>
                        )}
                        <p className="mt-0.5 text-xs text-secondary-500">
                          {rec.recommendation_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleActionRecommendation(rec.id)}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Action
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDismissRecommendation(rec.id)}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Automation Status */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-accent" />
            <h3 className="text-sm font-semibold text-white">Automation Status</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-surface-light p-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium text-white">Rules Active</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">
                {loading ? '-' : String(dueJobs)}
              </p>
              <p className="text-xs text-secondary-400">Active automation rules</p>
            </div>
            <div className="rounded-lg bg-surface-light p-4">
              <div className="flex items-center gap-2 text-blue-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium text-white">Scheduled Jobs</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">-</p>
              <p className="text-xs text-secondary-400">Use scheduler API to create</p>
            </div>
            <div className="rounded-lg bg-surface-light p-4">
              <div className="flex items-center gap-2 text-orange-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium text-white">Intelligence</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">
                {loading ? '-' : String(recommendations.length)}
              </p>
              <p className="text-xs text-secondary-400">Open recommendations</p>
            </div>
            <div className="rounded-lg bg-surface-light p-4">
              <div className="flex items-center gap-2 text-accent">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium text-white">Events</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">
                {summary ? String(summary.total) : '-'}
              </p>
              <p className="text-xs text-secondary-400">Total events processed</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
