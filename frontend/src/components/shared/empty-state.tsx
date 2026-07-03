import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Inbox, Lightbulb } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tips,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-light transition-transform group-hover:scale-110">
        {icon || <Inbox className="h-8 w-8 text-secondary-400" />}
      </div>
      <h3 className="mb-1 text-base font-semibold text-white">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-secondary-400">{description}</p>
      )}
      <div className="flex items-center gap-3">
        {action && (
          <Button variant="default" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" size="sm" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
      {tips && tips.length > 0 && (
        <div className="mt-6 rounded-lg bg-surface-light/50 px-4 py-3 text-left max-w-sm">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-secondary-400">
            <Lightbulb className="h-3.5 w-3.5" />
            Quick tips
          </div>
          <ul className="space-y-1">
            {tips.map((tip, i) => (
              <li key={i} className="text-xs text-secondary-500 flex items-start gap-1.5">
                <span className="mt-0.5 text-emerald-400">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
EmptyState.displayName = 'EmptyState';

export { EmptyState };
