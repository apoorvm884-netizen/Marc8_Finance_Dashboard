import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface PeriodOption {
  value: string;
  label: string;
}

interface ChartCardProps {
  title: string;
  period?: string;
  periods?: PeriodOption[];
  onPeriodChange?: (period: string) => void;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  subtitle?: string;
}

function ChartCard({
  title,
  period,
  periods,
  onPeriodChange,
  loading = false,
  children,
  className,
  action,
  subtitle,
}: ChartCardProps) {
  return (
    <Card glass hover className={cn('group overflow-hidden transition-all duration-300', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div className="min-w-0">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {subtitle && (
            <p className="mt-0.5 text-xs text-secondary-500">{subtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {periods && (
            <Select value={period} onValueChange={onPeriodChange}>
              <SelectTrigger className="h-7 w-[120px] text-xs">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="text" className="h-3 w-16" />
              <Skeleton variant="text" className="h-4 flex-1" />
              <Skeleton variant="text" className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton variant="text" className="h-3 w-16" />
              <Skeleton variant="text" className="h-4 flex-1" />
              <Skeleton variant="text" className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton variant="text" className="h-3 w-16" />
              <Skeleton variant="text" className="h-4 flex-1" />
              <Skeleton variant="text" className="h-3 w-20" />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
ChartCard.displayName = 'ChartCard';

export { ChartCard };
export type { ChartCardProps };
