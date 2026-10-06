'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { DataTablePagination, SearchBar } from '@/shared/components/molecules';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { getErrorMessage } from '@/shared/lib/api-error';
import { MANPOWER_LABELS } from '../constants';
import { useEmployeeRatings } from '../hooks/use-employee-ratings';
import {
  formatEmployeeRatingDateTime,
  formatEmployeeRatingScoreLabel,
  formatEmployeeRatingSourceLabel,
  formatEmployeeRatingValue,
  getEmployeeRatingSourceHref,
} from '../utils/rating';

const RATING_CATEGORY_ORDER = [
  'capability',
  'responsibility',
  'quality',
  'timeliness',
  'communication',
] as const;

const RATING_CATEGORY_FALLBACK_LABELS: Record<(typeof RATING_CATEGORY_ORDER)[number], string> = {
  capability: 'Capability',
  responsibility: 'Responsibility',
  quality: 'Quality',
  timeliness: 'Timeliness',
  communication: 'Communication',
};

interface EmployeeRatingTabProps {
  employeeId: string;
}

export function EmployeeRatingTab({ employeeId }: EmployeeRatingTabProps) {
  const ratingLabels = MANPOWER_LABELS.DETAIL.RATING;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const historyParams = useMemo(
    () => ({
      employeeId,
      sourceType: 'project',
      page,
      perPage,
    }),
    [employeeId, page, perPage]
  );

  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useEmployeeRatings(historyParams);

  const historyItems = historyResponse?.data ?? [];
  const historyMeta = historyResponse?.meta;
  const normalizedSearch = search.trim().toLowerCase();
  const hasActiveFilters = normalizedSearch.length > 0;

  const filteredHistoryItems = useMemo(() => {
    if (!normalizedSearch) return historyItems;

    return historyItems.filter((item) => {
      const searchableText = [
        item.source.label ?? '',
        formatEmployeeRatingSourceLabel(item.source),
        item.ratedBy?.name ?? '',
        formatEmployeeRatingValue(item.overallScore),
        formatEmployeeRatingDateTime(item.ratedAt),
        item.note ?? '',
        ...item.scores.flatMap((score) => [
          score.categoryName,
          formatEmployeeRatingValue(score.score),
          score.note ?? '',
        ]),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [historyItems, normalizedSearch]);

  const categoryColumns = useMemo(() => {
    const categoryLabels = new Map<string, string>();

    historyItems.forEach((item) => {
      item.scores.forEach((score) => {
        if (!categoryLabels.has(score.categoryCode)) {
          categoryLabels.set(score.categoryCode, score.categoryName);
        }
      });
    });

    const orderedCodes = [...RATING_CATEGORY_ORDER];

    categoryLabels.forEach((_, code) => {
      if (!orderedCodes.includes(code as (typeof RATING_CATEGORY_ORDER)[number])) {
        orderedCodes.push(code as (typeof RATING_CATEGORY_ORDER)[number]);
      }
    });

    return orderedCodes.map((code) => ({
      code,
      label: categoryLabels.get(code) ?? RATING_CATEGORY_FALLBACK_LABELS[code] ?? code,
    }));
  }, [historyItems]);

  const historyTotalItems = hasActiveFilters
    ? filteredHistoryItems.length
    : (historyMeta?.total ?? historyItems.length);
  const historyTotalPages = hasActiveFilters ? 1 : Math.max(historyMeta?.lastPage ?? 1, 1);
  const currentPage = Math.max(historyMeta?.currentPage ?? page, 1);
  const currentPageSize = historyMeta?.perPage ?? perPage;

  const historySearch = (
    <div className="border-b border-slate-200 px-4 py-4">
      <SearchBar
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        onClear={() => {
          setSearch('');
          setPage(1);
        }}
        showClear
        placeholder={ratingLabels.SEARCH}
        width="320px"
      />
    </div>
  );

  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">{ratingLabels.HISTORY_TITLE}</h2>
          <p className="text-sm text-slate-500">{ratingLabels.HISTORY_DESCRIPTION}</p>
        </div>
      </div>

      {isHistoryLoading && !historyResponse ? (
        <div className="overflow-hidden rounded-xl border bg-white">
          {historySearch}
          <RatingHistorySkeleton categoryCount={categoryColumns.length} />
        </div>
      ) : isHistoryError && !historyResponse ? (
        <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed bg-slate-50 px-6 text-sm text-destructive">
          {getErrorMessage(historyError)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          {historySearch}
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  {ratingLabels.COLUMNS.INFO_PROJECT}
                </TableHead>
                {categoryColumns.map((column) => (
                  <TableHead key={column.code} className="whitespace-nowrap">
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistoryItems.length ? (
                filteredHistoryItems.map((item) => {
                  const sourceHref = getEmployeeRatingSourceHref(item.source);
                  const sourceLabel = formatEmployeeRatingSourceLabel(item.source);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="align-top">
                        <div className="space-y-1.5">
                          <div className="space-y-0.5">
                            {sourceHref ? (
                              <Link
                                href={sourceHref}
                                className={cn(
                                  'block font-medium text-brand-600 underline-offset-2 hover:underline',
                                  item.source.deleted && 'text-slate-500'
                                )}
                              >
                                {sourceLabel}
                              </Link>
                            ) : (
                              <span
                                className={cn(
                                  'block font-medium',
                                  item.source.deleted && 'text-slate-500'
                                )}
                              >
                                {sourceLabel}
                              </span>
                            )}
                            <p className="text-xs text-slate-500">
                              {formatEmployeeRatingDateTime(item.ratedAt)} ·{' '}
                              {item.ratedBy?.name ?? '-'}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {categoryColumns.map((column) => {
                        const score = item.scores.find(
                          (entry) => entry.categoryCode === column.code
                        );

                        return (
                          <TableCell key={`${item.id}-${column.code}`} className="align-top">
                            {score ? (
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-900">
                                  {formatEmployeeRatingValue(score.score)}
                                </p>
                                {score.categoryStatus !== 'active' ? (
                                  <p className="text-xs text-slate-400">
                                    {formatEmployeeRatingScoreLabel(score)}
                                  </p>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={categoryColumns.length + 1}
                    className="h-28 text-center text-sm text-slate-500"
                  >
                    {hasActiveFilters ? ratingLabels.EMPTY_FILTERED : ratingLabels.EMPTY}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <DataTablePagination
            currentPage={currentPage}
            totalPages={historyTotalPages}
            pageSize={currentPageSize}
            totalItems={historyTotalItems}
            onPageChange={setPage}
            onPageSizeChange={(nextSize) => {
              setPage(1);
              setPerPage(nextSize);
            }}
          />
        </div>
      )}
    </section>
  );
}

function RatingHistorySkeleton({ categoryCount }: { categoryCount: number }) {
  return (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead>Info Project</TableHead>
          {Array.from({ length: categoryCount }).map((_, index) => (
            <TableHead key={index}>-</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell>
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
              </div>
            </TableCell>
            {Array.from({ length: categoryCount }).map((__, cellIndex) => (
              <TableCell key={cellIndex}>
                <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
