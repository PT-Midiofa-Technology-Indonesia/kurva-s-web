'use client';

import type { RowData } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { DataTable, type DataTableProps } from '@/components/organisms/DataTable';

type DataTableLayoutExtras<TData> = {
  filter?: ReactNode;
  onFilterChange?: (filteredData: TData[]) => void;
  containerClassName?: string;
  filterClassName?: string;
  isLoading?: boolean;
};

export type DataTableLayoutProps<TData, TValue> = DataTableProps<TData, TValue> &
  DataTableLayoutExtras<TData>;

export function DataTableLayout<TData extends RowData, TValue>({
  filter,
  onFilterChange: _onFilterChange,
  containerClassName,
  filterClassName,
  ...dataTableProps
}: DataTableLayoutProps<TData, TValue>) {
  return (
    <div className={containerClassName}>
      {filter && <div className={filterClassName}>{filter}</div>}
      <DataTable<TData, TValue> {...dataTableProps} />
    </div>
  );
}
