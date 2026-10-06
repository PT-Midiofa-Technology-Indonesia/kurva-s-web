'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTableLayout } from '@/components/templates/DataTableLayout';

export interface ListPageTemplateProps<TData> {
  // ── Header ────────────────────────────────────────────────────────────────
  title: string;
  /** Rendered to the right of the title — Add button, selectors, etc. */
  headerActions?: ReactNode;

  /** Optional banner/notice node rendered between header and table card. */
  banner?: ReactNode;

  // ── Table data ─────────────────────────────────────────────────────────────
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  enableRowSelection?: boolean;
  pageSizeOptions?: number[];

  // ── Pagination UI ──────────────────────────────────────────────────────────
  /** Enable pagination controls in the table (default: true). */
  enablePagination?: boolean;

  // ── Search ─────────────────────────────────────────────────────────────────
  /** Current search value synced from URL. Pass `queryParams.search`. */
  search?: string;
  searchPlaceholder?: string;
  /** Called with the new search string, or `undefined` to clear it. */
  onSearchChange?: (value: string | undefined) => void;

  // ── Extra filters ──────────────────────────────────────────────────────────
  /**
   * Additional filter controls rendered to the right of the search bar.
   * Domain pages compose whatever selects, date pickers, etc. they need here.
   */
  toolbarRight?: ReactNode;

  // ── Sorting ────────────────────────────────────────────────────────────────
  /** Active sort column key synced from URL. Pass `queryParams.sortBy`. */
  sortBy?: string;
  /** Active sort direction synced from URL. Pass `queryParams.sortOrder`. */
  sortOrder?: 'asc' | 'desc';
  /** Called when the user clicks a column header. Update the URL with this. */
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;

  // ── Pagination ─────────────────────────────────────────────────────────────
  /** Current page (1-based) from URL. Pass the memoised `params.page`. */
  page?: number;
  /** Items-per-page from URL. Pass the memoised `params.perPage`. */
  perPage?: number;
  totalItems?: number;
  totalPages?: number;
  /** Called when the user changes page or page size. Update the URL with this. */
  onPaginationChange?: (page: number, perPage: number) => void;
}

export function ListPageTemplate<TData>({
  title,
  headerActions,
  banner,
  data,
  columns,
  isLoading = false,
  isError = false,
  errorMessage = 'Something went wrong. Please try again.',
  emptyMessage = 'No data found.',
  enableRowSelection = false,
  pageSizeOptions,
  enablePagination = true,
  search = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  toolbarRight,
  sortBy,
  sortOrder,
  onSort,
  page = 1,
  perPage = 10,
  totalItems,
  totalPages,
  onPaginationChange,
}: ListPageTemplateProps<TData>) {
  // ── Search input — local state kept in sync with the URL prop ─────────────
  const [inputValue, setInputValue] = useState(search ?? '');

  useEffect(() => {
    setInputValue(search ?? '');
  }, [search]);

  const handleClearSearch = useCallback(() => {
    setInputValue('');
    onSearchChange?.(undefined);
  }, [onSearchChange]);

  const handleDebounce = useCallback(
    (value: string) => onSearchChange?.(value || undefined),
    [onSearchChange]
  );

  // ── Sorting — TanStack SortingState ↔ plain string props ─────────────────
  const initialSorting: SortingState = sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : [];

  const handleSortingChange = useCallback(
    (newSorting: SortingState) => {
      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        onSort?.(id, desc ? 'desc' : 'asc');
      } else {
        onSort?.('', 'asc');
      }
    },
    [onSort]
  );

  // ── Filter bar ────────────────────────────────────────────────────────────
  const filterBar = (
    <div className="flex gap-3 items-center p-4">
      <SearchBar
        placeholder={searchPlaceholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onClear={handleClearSearch}
        onDebounce={handleDebounce}
        width="288px"
        showClear
      />
      <div className="flex-1" />
      {toolbarRight}
    </div>
  );

  // ── Loading / error state inside table ───────────────────────────────────
  const tableContent = isError ? (
    <div className="flex items-center justify-center py-12">
      <p className="text-red-600">{errorMessage}</p>
    </div>
  ) : enablePagination ? (
    <DataTableLayout
      columns={columns}
      data={data}
      initialSorting={initialSorting}
      onSortingChange={handleSortingChange}
      initialPage={page}
      initialPageSize={perPage}
      onPaginationChange={onPaginationChange}
      totalItems={totalItems}
      totalPages={totalPages}
      pageSizeOptions={pageSizeOptions}
      emptyMessage={emptyMessage}
      enableRowSelection={enableRowSelection}
      enableColumnResize={false}
      enableColumnDnd={false}
      enablePagination={true}
      enableZebraStripes={false}
      filter={filterBar}
      className="shadow-none rounded-none"
      isLoading={isLoading}
    />
  ) : (
    <DataTableLayout
      columns={columns}
      data={data}
      initialSorting={initialSorting}
      onSortingChange={handleSortingChange}
      emptyMessage={emptyMessage}
      enableRowSelection={enableRowSelection}
      enableColumnResize={false}
      enableColumnDnd={false}
      enablePagination={false}
      enableZebraStripes={false}
      filter={filterBar}
      className="shadow-none rounded-none"
      isLoading={isLoading}
    />
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
        {headerActions}
      </div>

      {banner}

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {tableContent}
      </div>
    </div>
  );
}
