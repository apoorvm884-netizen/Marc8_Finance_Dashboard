import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity, CheckCircle2, Clock, AlertTriangle, ListTodo,
  FileCheck, ShieldAlert, BarChart3, ArrowRight, UserCheck,
} from 'lucide-react';
import { taskService } from '@/services/task.service';
import { approvalService } from '@/services/approval.service';
import { slaService } from '@/services/sla.service';
import { activityService } from '@/services/activity.service';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { DataTable } from '@/components/shared/data-table';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Task, ActivityLogEntry, TaskSummary, ApprovalRequest, SLABreach } from '@/types/workflow';
import type { ColumnDef } from '@tanstack/react-table';

export default function OperationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [openBreaches, setOpenBreaches] = useState<SLABreach[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, tasksRes, approvalsRes, breachesRes, activityRes] = await Promise.allSettled([
        taskService.getSummary(),
        taskService.findAll({ limit: '5', sort_by: 'created_at', sort_order: 'desc' }),
        approvalService.findAll({ status: 'pending' }),
        slaService.getBreaches({ status: 'open' }),
        activityService.findAll({ limit: '10' }),
      ]);

      if (summaryRes.status === 'fulfilled') setTaskSummary(summaryRes.value);
      if (tasksRes.status === 'fulfilled') setRecentTasks(tasksRes.value.data ?? []);
      if (approvalsRes.status === 'fulfilled') setPendingApprovals(approvalsRes.value.data ?? []);
      if (breachesRes.status === 'fulfilled') setOpenBreaches(breachesRes.value.data ?? []);
      if (activityRes.status === 'fulfilled') setRecentActivity(activityRes.value.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const taskColumns: ColumnDef<Task>[] = [
    {
      accessorKey: 'title',
      header: 'Task',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-white">{row.original.title}</span>
          {row.original.entity_type && (
            <p className="text-xs text-secondary-400">{row.original.entity_type}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <Badge variant={
          row.original.priority === 'urgent' ? 'destructive' :
          row.original.priority === 'high' ? 'warning' :
          row.original.priority === 'low' ? 'default' : 'secondary'
        }>
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={
          row.original.status === 'completed' ? 'success' :
          row.original.status === 'in_progress' ? 'warning' :
          row.original.status === 'cancelled' ? 'destructive' : 'default'
        }>
          {row.original.status?.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'assigned_to_name',
      header: 'Assignee',
      cell: ({ row }) => (
        <span className="text-secondary-300">{row.original.assigned_to_name || '-'}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/tasks/${row.original.id}`)}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Operations Center"
        description="Workflow instances, tasks, approvals, SLA monitoring, and activity timeline"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<ListTodo className="h-4 w-4" />}
            iconBg="blue"
            label="Pending Tasks"
            value={taskSummary ? String(taskSummary.pending + taskSummary.in_progress) : '0'}
            trend={taskSummary && taskSummary.overdue > 0 ? 'down' : undefined}
            trendValue={taskSummary && taskSummary.overdue > 0 ? `${taskSummary.overdue} overdue` : undefined}
            subtitle="Tasks requiring action"
            loading={loading}
          />
          <MetricCard
            icon={<FileCheck className="h-4 w-4" />}
            iconBg="green"
            label="Completed Tasks"
            value={taskSummary ? String(taskSummary.completed) : '0'}
            subtitle="Tasks finished this period"
            loading={loading}
          />
          <MetricCard
            icon={<UserCheck className="h-4 w-4" />}
            iconBg="orange"
            label="Pending Approvals"
            value={String(pendingApprovals.length)}
            subtitle="Awaiting your decision"
            loading={loading}
          />
          <MetricCard
            icon={<AlertTriangle className="h-4 w-4" />}
            iconBg="red"
            label="SLA Breaches"
            value={String(openBreaches.length)}
            subtitle="Open SLA violations"
            loading={loading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold text-white">Recent Tasks</h3>
              </div>
              {user && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role) && (
                <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>
                  View All
                </Button>
              )}
            </div>
            <DataTable
              columns={taskColumns}
              data={recentTasks}
              loading={loading}
              emptyMessage="No tasks found"
              pageSize={5}
            />
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-light" />
                ))
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-secondary-400">No recent activity</p>
              ) : (
                recentActivity.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-lg bg-surface-light p-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent/10">
                      <Activity className="h-3 w-3 text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{entry.description || entry.action}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-secondary-400">
                        <span>{entry.entity_type}</span>
                        <span>·</span>
                        <span>{entry.performed_by_name || 'System'}</span>
                        <span>·</span>
                        <span>{new Date(entry.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold text-white">Pending Approvals</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="rounded-lg border border-border bg-surface-light p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="warning">{approval.request_type}</Badge>
                    <span className="text-xs text-secondary-400">
                      Level {approval.level}/{approval.max_level}
                    </span>
                  </div>
                  <p className="text-sm text-white">{approval.entity_type}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-secondary-400">
                    <span>{approval.requested_by_name || 'Unknown'}</span>
                    <span>{new Date(approval.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open SLA Breaches */}
        {openBreaches.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-sm font-semibold text-destructive">Open SLA Breaches</h3>
            </div>
            <div className="space-y-2">
              {openBreaches.slice(0, 5).map((breach) => (
                <div key={breach.id} className="flex items-center justify-between rounded-lg bg-surface-light p-3">
                  <div>
                    <p className="text-sm text-white">{breach.sla_name || breach.entity_type}</p>
                    <p className="text-xs text-secondary-400">
                      Severity: {breach.severity || 'medium'} · Expected: {new Date(breach.expected_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="destructive">{breach.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
