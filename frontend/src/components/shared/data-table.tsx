import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type TableOptions,
  type PaginationState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import {
  ChevronDown,
  Columns3,
  Download,
  EyeOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Maximize2,
  SearchX,
} from 'lucide-react';

type TableDensity = 'compact' | 'normal' | 'comfortable';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchable?: boolean;
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  enableSelection?: boolean;
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableDensity?: boolean;
  stickyHeader?: boolean;
  onExportCSV?: () => void;
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  meta?: Record<string, unknown>;
}

const densityStyles: Record<TableDensity, { cell: string; header: string }> = {
  compact: { cell: 'py-1.5 px-2 text-xs', header: 'py-2 px-2 text-xs' },
  normal: { cell: 'py-3 px-3 text-sm', header: 'py-3 px-3 text-sm' },
  comfortable: { cell: 'py-4 px-4 text-sm', header: 'py-4 px-4 text-sm' },
};

function DataTable<TData>({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  searchable = false,
  searchPlaceholder = 'Search...',
  pageSize: defaultPageSize = 10,
  pageSizeOptions,
  enableSelection = false,
  enableSorting = true,
  enableColumnVisibility = true,
  enableExport = false,
  enableDensity = true,
  stickyHeader = true,
  onExportCSV,
  onRowClick,
  onSelectionChange,
  emptyMessage = 'No results found',
  emptyDescription,
  emptyIcon,
  footer,
  className,
  tableClassName,
  meta,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [density, setDensity] = React.useState<TableDensity>('normal');
  const [scrolled, setScrolled] = React.useState(false);
  const tableRef = React.useRef<HTMLDivElement>(null);

  const allColumns = React.useMemo(() => {
    if (!enableSelection) return columns;
    return [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      } as ColumnDef<TData>,
      ...columns,
    ];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting,
    enableRowSelection: enableSelection,
    meta,
  } as TableOptions<TData>);

  const hasSearchFilter = globalFilter.length > 0 || columnFilters.length > 0;
  const isEmpty = !loading && table.getRowModel().rows.length === 0;
  const isFilteredEmpty = isEmpty && hasSearchFilter;
  const selectedCount = Object.keys(rowSelection).length;

  React.useEffect(() => {
    if (onSelectionChange && enableSelection) {
      const ids = Object.keys(rowSelection).filter((key) => rowSelection[key]);
      onSelectionChange(ids);
    }
  }, [rowSelection, onSelectionChange, enableSelection]);

  React.useEffect(() => {
    const el = tableRef.current;
    if (!el || !stickyHeader) return;
    const handler = () => setScrolled(el.scrollTop > 0);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [stickyHeader]);

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    const visibleColumns = table.getVisibleFlatColumns().filter(c => c.id !== 'select');
    const headers = visibleColumns.map(col => {
      if (typeof col.columnDef.header === 'string') return col.columnDef.header;
      return col.id;
    });
    const rows = table.getRowModel().rows.map(row =>
      visibleColumns.map(col => {
        const value = row.getValue(col.id);
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return <ErrorState message={error} retry={onRetry ? { onClick: onRetry } : undefined} />;
  }

  const densityStyle = densityStyles[density];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      {(searchable || enableColumnVisibility || enableExport || enableDensity) && (
        <div className="action-bar">
          <div className="action-bar-group flex-1">
            {searchable && (
              <SearchInput
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder={searchPlaceholder}
                className="w-full sm:max-w-xs"
              />
            )}
          </div>
          <div className="action-bar-group">
            {enableDensity && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" icon={<Maximize2 className="h-4 w-4" />}>
                    <span className="hidden sm:inline">Density</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  {(['compact', 'normal', 'comfortable'] as const).map((d) => (
                    <DropdownMenuCheckboxItem
                      key={d}
                      checked={density === d}
                      onCheckedChange={() => setDensity(d)}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {enableExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                icon={<Download className="h-4 w-4" />}
              >
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" icon={<Columns3 className="h-4 w-4" />}>
                    <span className="hidden sm:inline">Columns</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() =>
                      table.getAllColumns().forEach((col) => col.toggleVisibility(true))
                    }
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    Show all
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .slice()
                    .sort((a, b) => {
                      const aH = typeof a.columnDef.header === 'string' ? a.columnDef.header : a.id;
                      const bH = typeof b.columnDef.header === 'string' ? b.columnDef.header : b.id;
                      return aH.localeCompare(bH);
                    })
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        checked={col.getIsVisible()}
                        onCheckedChange={(value) => col.toggleVisibility(!!value)}
                      >
                        {typeof col.columnDef.header === 'string'
                          ? col.columnDef.header
                          : col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {/* Selected count */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-accent-500/10 px-3 py-2 text-sm text-accent-400">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
          <span>{selectedCount} row(s) selected</span>
          <button
            type="button"
            onClick={() => table.resetRowSelection()}
            className="ml-auto text-xs text-secondary-400 hover:text-white transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div
        ref={tableRef}
        className={cn(
          'table-container relative rounded-xl border border-border',
          stickyHeader && 'max-h-[calc(100vh-20rem)]'
        )}
        role="region"
        aria-label="Data table"
      >
        <Table className={tableClassName}>
          <TableHeader
            className={cn(
              stickyHeader && 'sticky top-0 z-10',
              scrolled && stickyHeader && 'shadow-md shadow-black/20'
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortDir = header.column.getIsSorted();
                  const ariaSort = sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : header.column.getCanSort() ? 'none' : undefined;
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={ariaSort}
                      className={cn(densityStyle.header, 'bg-card')}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-1.5',
                          header.column.getCanSort() && 'cursor-pointer select-none group'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        role="columnheader"
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e as unknown as React.MouseEvent);
                          }
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.column.getCanSort() && (
                          <span className="text-secondary-500 transition-opacity group-hover:opacity-100">
                            {{
                              asc: <ArrowUp className="h-3 w-3 text-accent-400" />,
                              desc: <ArrowDown className="h-3 w-3 text-accent-400" />,
                            }[sortDir as string] ?? (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-60" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(pagination.pageSize, 8) }).map((_, rowIdx) => (
                <TableRow key={`skeleton-${rowIdx}`}>
                  {allColumns.map((col, colIdx) => (
                    <TableCell key={col.id || colIdx} className={densityStyle.cell}>
                      <Skeleton
                        variant="text"
                        className={cn(
                          'h-4',
                          colIdx === 0 && 'w-3/4',
                          colIdx === 1 && 'w-1/2',
                          colIdx === 2 && 'w-2/3'
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-48 text-center"
                >
                  <EmptyState
                    title={isFilteredEmpty ? 'No matching results' : emptyMessage}
                    description={isFilteredEmpty ? 'Try adjusting your search or filters.' : emptyDescription}
                    icon={isFilteredEmpty ? <SearchX className="h-6 w-6" /> : emptyIcon}
                    className="border-0 min-h-0 bg-transparent"
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    onRowClick && 'cursor-pointer',
                    'transition-colors duration-150'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={densityStyle.cell}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {footer && <TableFooter>{footer}</TableFooter>}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && table.getPageCount() > 0 && (
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          totalItems={table.getFilteredRowModel().rows.length}
          pageSize={table.getState().pagination.pageSize}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}
DataTable.displayName = 'DataTable';

const MemoizedDataTable = React.memo(DataTable) as typeof DataTable;
MemoizedDataTable.displayName = 'DataTable';

export { MemoizedDataTable as DataTable };
export type { DataTableProps, TableDensity };
