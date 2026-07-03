import * as React from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumb } from '@/components/shared/breadcrumb';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  withBreadcrumb?: boolean;
}

function PageHeader({
  title,
  description,
  actions,
  className,
  withBreadcrumb = true,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {withBreadcrumb && <Breadcrumb className="mb-3" />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-secondary-400">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
PageHeader.displayName = 'PageHeader';

export { PageHeader };
