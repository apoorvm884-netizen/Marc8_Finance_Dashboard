import * as React from 'react';
import {
  flexRender,
  type Header,
  type Row,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const TableContext = React.createContext<{ striped?: boolean }>({});

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { striped?: boolean }
>(({ className, striped, ...props }, ref) => (
  <TableContext.Provider value={{ striped }}>
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  </TableContext.Provider>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b border-border', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-border bg-surface-light font-medium', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => {
  const { striped } = React.useContext(TableContext);
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border transition-colors duration-150 hover:bg-surface-light/70 data-[state=selected]:bg-surface-light',
        striped && 'even:bg-surface/30',
        className
      )}
      {...props}
    />
  );
});
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-11 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-secondary-400',
      '[&:has([role=columnheader])]:cursor-pointer [&:has([role=columnheader])]:select-none',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle text-secondary-200', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-xs text-secondary-500', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

interface DataTableHeaderCellProps<TData> {
  header: Header<TData, unknown>;
}

function DataTableHeaderCell<TData>({ header }: DataTableHeaderCellProps<TData>) {
  const isSortable = header.column.getCanSort();
  const sortDirection = header.column.getIsSorted();

  return (
    <TableHead
      className={cn(isSortable && 'cursor-pointer select-none')}
      onClick={header.column.getToggleSortingHandler()}
      colSpan={header.colSpan}
    >
      <div className="flex items-center gap-1.5">
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        {isSortable && (
          <span className="text-secondary-500">
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            )}
          </span>
        )}
      </div>
    </TableHead>
  );
}

interface DataTableRowProps<TData> {
  row: Row<TData>;
}

function DataTableRow<TData>({ row }: DataTableRowProps<TData>) {
  return (
    <TableRow data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-4 flex-1 animate-pulse rounded bg-surface-lighter"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface TableEmptyProps {
  colSpan: number;
  message?: string;
  icon?: React.ReactNode;
}

function TableEmpty({ colSpan, message = 'No results found', icon }: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-secondary-500">
          {icon}
          <span className="text-sm">{message}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  DataTableHeaderCell,
  DataTableRow,
  TableSkeleton,
  TableEmpty,
};
