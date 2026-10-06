import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface TableColumn {
  header: ReactNode;
  className?: string;
  renderCell?: (value: ReactNode) => ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: ReactNode[][];
  emptyMessage?: string;
  /** className applied to the outer container div. Pass "" to disable the default container. */
  containerClassName?: string;
  className?: string;
  /** Number of columns to span when showing empty state. Defaults to columns.length. */
  colSpan?: number;
  /** Show a loading spinner instead of table content. */
  isLoading?: boolean;
}

const DEFAULT_CONTAINER_CLASS =
  'rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden';

export function Table({
  columns,
  data,
  emptyMessage = 'No data.',
  containerClassName,
  className,
  colSpan,
  isLoading = false,
}: TableProps) {
  const container = containerClassName !== undefined ? containerClassName : DEFAULT_CONTAINER_CLASS;

  const table = (
    <ShadcnTable className={className}>
      <TableHeader className="bg-slate-50">
        <TableRow>
          {columns.map((col, i) => (
            <TableHead key={i} className={cn('text-slate-500 p-4', col.className)}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={colSpan ?? columns.length} className="text-center">
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colSpan ?? columns.length} className="text-center text-slate-400">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => {
                const column = columns[cellIndex];
                const renderedCell = column?.renderCell ? column.renderCell(cell) : cell;
                return (
                  <TableCell key={cellIndex} className={cn('px-4', column?.className)}>
                    {renderedCell}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        )}
      </TableBody>
    </ShadcnTable>
  );

  if (!container) return table;

  return <div className={container}>{table}</div>;
}
