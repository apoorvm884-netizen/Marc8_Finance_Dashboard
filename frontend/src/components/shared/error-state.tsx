import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  description?: string;
  retry?: {
    label?: string;
    onClick: () => void;
  };
  className?: string;
}

function ErrorState({
  icon,
  title = 'Something went wrong',
  message,
  description = 'An unexpected error occurred. Please try again.',
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        {icon || <AlertTriangle className="h-8 w-8 text-red-400" />}
      </div>
      <h3 className="mb-1 text-base font-semibold text-white">{title}</h3>
      {message && (
        <p className="mb-1 text-sm text-red-400">{message}</p>
      )}
      {description && !message && (
        <p className="mb-4 max-w-sm text-sm text-secondary-400">{description}</p>
      )}
      {description && message && (
        <p className="mb-4 max-w-sm text-sm text-secondary-400">{description}</p>
      )}
      {retry && (
        <Button
          variant="default"
          size="sm"
          onClick={retry.onClick}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          {retry.label || 'Try again'}
        </Button>
      )}
    </div>
  );
}
ErrorState.displayName = 'ErrorState';

export { ErrorState };
