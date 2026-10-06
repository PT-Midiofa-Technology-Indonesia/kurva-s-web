'use client';

import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 30, 50, 100],
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to =
    totalItems == null ? currentPage * pageSize : Math.min(currentPage * pageSize, totalItems);
  const totalRows = totalItems ?? 0;

  const pages = getPageNumbers(currentPage, totalPages);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t">
      <span className="text-sm text-slate-500">
        Showing {from} to {to} of {totalRows} entries
      </span>

      <div className="flex items-center gap-6">
        {/* Per-page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Show</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="w-15.25 appearance-none rounded-lg border border-slate-300 bg-white py-1.25 pl-3 pr-7 text-sm text-slate-950 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none cursor-pointer"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>

        {/* Previous / page numbers / Next */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canPrev}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-950 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>

          {pages.map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex size-9 items-center justify-center text-sm text-slate-950"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page as number)}
                className={cn(
                  'flex size-9 items-center justify-center rounded-lg text-sm font-medium',
                  page === currentPage
                    ? 'bg-slate-950 text-slate-50'
                    : 'text-slate-950 hover:bg-slate-200'
                )}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canNext}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-950 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
