import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { FleetHealthSummary } from '@/types/dashboard';
import { Shield, Wrench, Ban, CalendarCheck, Gauge, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  fleetHealth: FleetHealthSummary | null;
  loading: boolean;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function HealthMeter({ score }: { score: number }) {
  const color = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400';
  const barColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            stroke="currentColor" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={barColor}
          />
        </svg>
        <span className={cn('absolute text-2xl font-bold', color)}>{score}</span>
      </div>
      <span className="text-xs font-medium text-secondary-400">Health Score</span>
    </div>
  );
}

function ComplianceBadge({ icon, label, count, critical }: { icon: React.ReactNode; label: string; count: number; critical?: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 hover:scale-[1.01]',
      count > 0
        ? (critical ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5')
        : 'border-emerald-500/20 bg-emerald-500/5'
    )}>
      <div className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg',
        count > 0
          ? (critical ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400')
          : 'bg-emerald-500/10 text-emerald-400'
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-secondary-300">{label}</p>
      </div>
      <span className={cn(
        'text-lg font-bold tabular-nums',
        count > 0
          ? (critical ? 'text-red-400' : 'text-amber-400')
          : 'text-emerald-400'
      )}>
        {count}
      </span>
    </div>
  );
}

export function DashboardFleetHealthSection({ fleetHealth, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <div className="p-5 space-y-3">
              <Skeleton variant="text" className="h-10 w-10 rounded-lg" />
              <Skeleton variant="text" className="h-3 w-24" />
              <Skeleton variant="text" className="h-6 w-8" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!fleetHealth) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-secondary-500">Fleet health data not available</p>
      </div>
    );
  }

  const totalDue = fleetHealth.insurance_due + fleetHealth.fitness_due + fleetHealth.pollution_due + fleetHealth.rc_due + fleetHealth.permit_due;
  const hasIssues = fleetHealth.expired_documents > 0 || fleetHealth.vehicles_in_maintenance > 0 || totalDue > 0;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Health Score */}
      <motion.div variants={item}>
        <Card glass hover>
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
              <Gauge className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-4 flex-1">
              <HealthMeter score={fleetHealth.health_score} />
              <div className="space-y-1">
                <p className="text-xs text-secondary-400">
                  {hasIssues ? 'Issues detected' : 'All clear'}
                </p>
                <Badge variant={fleetHealth.health_score >= 70 ? 'success' : fleetHealth.health_score >= 40 ? 'warning' : 'destructive'} size="sm">
                  {fleetHealth.health_score >= 70 ? 'Good' : fleetHealth.health_score >= 40 ? 'Fair' : 'Critical'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Expired Documents */}
      <motion.div variants={item}>
        <ComplianceBadge
          icon={<Ban className="h-5 w-5" />}
          label="Expired Documents"
          count={fleetHealth.expired_documents}
          critical
        />
      </motion.div>

      {/* Vehicles in Maintenance */}
      <motion.div variants={item}>
        <ComplianceBadge
          icon={<Wrench className="h-5 w-5" />}
          label="In Maintenance"
          count={fleetHealth.vehicles_in_maintenance}
        />
      </motion.div>

      {/* Insurance Due */}
      <motion.div variants={item}>
        <ComplianceBadge
          icon={<Shield className="h-5 w-5" />}
          label="Insurance Due (30d)"
          count={fleetHealth.insurance_due}
        />
      </motion.div>

      {/* Fitness Due */}
      <motion.div variants={item}>
        <ComplianceBadge
          icon={<CalendarCheck className="h-5 w-5" />}
          label="Fitness Due (30d)"
          count={fleetHealth.fitness_due}
        />
      </motion.div>

      {/* Other Due */}
      <motion.div variants={item}>
        <ComplianceBadge
          icon={<LayoutGrid className="h-5 w-5" />}
          label="Other Due (30d)"
          count={fleetHealth.pollution_due + fleetHealth.rc_due + fleetHealth.permit_due + fleetHealth.maintenance_due}
        />
      </motion.div>
    </div>
  );
}
