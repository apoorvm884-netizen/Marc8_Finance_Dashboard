import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva('animate-pulse rounded bg-surface-lighter', {
  variants: {
    variant: {
      text: 'h-4 w-full',
      circle: 'rounded-full',
      card: 'h-40 w-full rounded-xl',
      'table-row': 'h-12 w-full',
      chart: 'h-64 w-full rounded-xl',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  asChild?: boolean;
}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}
Skeleton.displayName = 'Skeleton';

function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6">
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="text" className="w-2/3" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  );
}
SkeletonCard.displayName = 'SkeletonCard';

function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} variant="text" className="h-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} variant="text" className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}
SkeletonTable.displayName = 'SkeletonTable';

function SkeletonChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-20" />
      </div>
      <Skeleton variant="chart" />
    </div>
  );
}
SkeletonChart.displayName = 'SkeletonChart';

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonChart };
