'use client';

import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/atoms';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface FieldArrayTableColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T, index: number) => ReactNode;
}

export interface FieldArrayTableProps<T> {
  columns: FieldArrayTableColumn<T>[];
  rows: T[];
  emptyMessage: string;
  onRemove?: (index: number) => void;
  toolbar?: ReactNode;
}

const ALIGN_CLASS: Record<'left' | 'right' | 'center', string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function FieldArrayTable<T>({
  columns,
  rows,
  emptyMessage,
  onRemove,
  toolbar,
}: FieldArrayTableProps<T>) {
  return (
    <div>
      {toolbar && (
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
          {toolbar}
        </div>
      )}

      {rows.length > 0 ? (
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    'px-6 py-3 font-medium text-slate-500 h-auto whitespace-normal',
                    ALIGN_CLASS[col.align ?? 'left']
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
              {onRemove && (
                <TableHead className="px-6 py-3 text-center font-medium text-slate-500 w-16">
                  Action
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={(row as any).id ?? index}
                className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50"
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn('px-6 py-3 whitespace-normal', ALIGN_CLASS[col.align ?? 'left'])}
                  >
                    {col.render(row, index)}
                  </TableCell>
                ))}
                {onRemove && (
                  <TableCell className="px-6 py-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onRemove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="px-6 py-4 text-sm text-slate-500">{emptyMessage}</div>
      )}
    </div>
  );
}
