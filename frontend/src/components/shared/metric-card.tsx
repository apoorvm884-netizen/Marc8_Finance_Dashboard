import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type FinancialSemantic = 'green' | 'red' | 'orange' | 'blue' | 'neutral';

interface MetricCardProps {
  icon?: React.ReactNode;
  iconBg?: FinancialSemantic;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  semantic?: FinancialSemantic;
}

const semanticStyles: Record<FinancialSemantic, { icon: string; border: string; accent: string }> = {
  green: { icon: 'bg-emerald-500/10 text-emerald-400', border: 'hover:border-emerald-500/20', accent: 'text-emerald-400' },
  red: { icon: 'bg-red-500/10 text-red-400', border: 'hover:border-red-500/20', accent: 'text-red-400' },
  orange: { icon: 'bg-amber-500/10 text-amber-400', border: 'hover:border-amber-500/20', accent: 'text-amber-400' },
  blue: { icon: 'bg-blue-500/10 text-blue-400', border: 'hover:border-blue-500/20', accent: 'text-blue-400' },
  neutral: { icon: 'bg-accent-500/10 text-accent-400', border: 'hover:border-accent-500/20', accent: 'text-accent-400' },
};

function MetricCard({
  icon,
  iconBg = 'neutral',
  label,
  value,
  trend,
  trendValue,
  subtitle,
  loading = false,
  className,
  semantic,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className="p-5">
          <div className="space-y-3">
            <Skeleton variant="text" className="h-9 w-9 rounded-lg" />
            <Skeleton variant="text" className="h-3 w-20" />
            <Skeleton variant="text" className="h-7 w-32" />
            <Skeleton variant="text" className="h-3 w-24" />
          </div>
        </div>
      </Card>
    );
  }

  const styles = semantic ? semanticStyles[semantic] : semanticStyles[iconBg];

  return (
    <Card
      glass
      hover
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        styles.border,
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          {icon && (
            <div className={cn(
              'mb-3 flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110',
              styles.icon
            )}>
              {icon}
            </div>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                trend === 'up' && 'bg-emerald-500/10 text-emerald-400',
                trend === 'down' && 'bg-red-500/10 text-red-400',
                trend === 'neutral' && 'bg-secondary-500/10 text-secondary-400'
              )}
            >
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {trendValue || ''}
            </div>
          )}
        </div>
        <p className={cn(
          'mb-0.5 text-xs font-medium tracking-wide uppercase',
          semantic ? styles.accent : 'text-secondary-400'
        )}>
          {label}
        </p>
        <p className="mb-1 text-2xl font-bold tracking-tight text-white">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-secondary-500">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
MetricCard.displayName = 'MetricCard';

const MemoizedMetricCard = React.memo(MetricCard);
MemoizedMetricCard.displayName = 'MetricCard';

export { MemoizedMetricCard as MetricCard };
export type { MetricCardProps, FinancialSemantic };
