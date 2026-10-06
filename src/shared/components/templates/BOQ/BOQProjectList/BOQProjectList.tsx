'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DataTable } from '@/components/organisms/DataTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BOQProjectListConfig } from '../types/boq-labels.types';
import type { BOQProjectListItem, BOQProjectListStage } from '../types/boq-project-list.types';
import { buildBOQProjectListColumns } from './boq-project-list-columns';

export interface BOQProjectListProps {
  config: BOQProjectListConfig;
  data: BOQProjectListItem[];
  renderAction: (project: BOQProjectListItem) => ReactNode;
  isLoading?: boolean;
  searchValue?: string;
  filterValue?: string;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  onSearch?: (value: string) => void;
  onFilterChange?: (value: string) => void;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onProjectClick?: (project: BOQProjectListItem) => void;
  stage?: BOQProjectListStage;
  onViewSetting?: (project: BOQProjectListItem) => void;
  onViewHistory?: (project: BOQProjectListItem) => void;
}

export function BOQProjectList({
  config,
  data,
  renderAction,
  isLoading,
  searchValue = '',
  filterValue = '',
  page = 1,
  pageSize = 10,
  totalItems,
  totalPages,
  onSearch,
  onFilterChange,
  onPaginationChange,
  onProjectClick,
}: BOQProjectListProps) {
  const columns = useMemo<ColumnDef<BOQProjectListItem>[]>(
    () => buildBOQProjectListColumns(config, renderAction, onProjectClick),
    [config, renderAction, onProjectClick]
  );

  const currentFilterLabel = useMemo(() => {
    if (!filterValue || !config.filterOptions) {
      return config.filterPlaceholder ?? 'Semua Setting';
    }
    return (
      config.filterOptions.find((o) => o.value === filterValue)?.label ??
      config.filterPlaceholder ??
      'Semua Setting'
    );
  }, [config.filterOptions, config.filterPlaceholder, filterValue]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div className="relative w-[288px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Pencarian"
            className="w-full pl-10"
          />
        </div>

        {config.showFilter && config.filterOptions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-between gap-1 w-[186px]"
              >
                <span>{currentFilterLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={filterValue} onValueChange={onFilterChange}>
                {config.filterOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <DataTable<BOQProjectListItem, unknown>
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        enablePagination
        pageSizeOptions={[5, 10, 20, 50]}
        initialPage={page}
        initialPageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={onPaginationChange}
        enableColumnDnd={false}
        enableColumnResize={false}
        emptyMessage="Belum ada data"
      />
    </div>
  );
}

export default BOQProjectList;
