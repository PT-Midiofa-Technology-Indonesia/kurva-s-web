'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/shared/components/molecules/SearchBar';
import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { useVendorRatings } from '../hooks/use-vendor-ratings';
import type { VendorRatingHistoryItem } from '../types';
import {
  formatVendorRatingDateTime,
  formatVendorRatingSourceLabel,
  formatVendorRatingValue,
  getVendorRatingSourceHref,
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

interface VendorRatingTabProps {
  vendorId: string;
}

export function VendorRatingTab({ vendorId }: VendorRatingTabProps) {
  const ratingLabels = VENDOR_CATALOG_LABELS.RATING;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const historyParams = useMemo(
    () => ({
      vendorId,
      page,
      perPage,
    }),
    [page, perPage, vendorId]
  );

  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useVendorRatings(historyParams);

  const historyItems = historyResponse?.data ?? [];
  const historyMeta = historyResponse?.meta;
  const normalizedSearch = search.trim().toLowerCase();
  const hasActiveFilters = normalizedSearch.length > 0;

  const filteredHistoryItems = useMemo(() => {
    if (!normalizedSearch) return historyItems;

    return historyItems.filter((item) => {
      const searchableText = [
        item.source.label,
        formatVendorRatingSourceLabel(item.source),
        item.ratedBy?.name ?? '',
        formatVendorRatingValue(item.overallScore),
        formatVendorRatingDateTime(item.ratedAt),
        ...item.scores.flatMap((score) => [
          score.categoryName,
          formatVendorRatingValue(score.score),
        ]),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [historyItems, normalizedSearch]);

  const historyTotalItems = hasActiveFilters ? filteredHistoryItems.length : historyMeta?.total;
  const historyTotalPages = hasActiveFilters ? 1 : (historyMeta?.lastPage ?? 1);

  const ratingCategoryColumns = useMemo(() => {
    const categoryLabels = new Map<string, string>();

    historyItems.forEach((item) => {
      item.scores.forEach((score) => {
        if (!categoryLabels.has(score.categoryCode)) {
          categoryLabels.set(score.categoryCode, score.categoryName);
        }
      });
    });

    return RATING_CATEGORY_ORDER.map((code) => ({
      code,
      label: categoryLabels.get(code) ?? RATING_CATEGORY_FALLBACK_LABELS[code],
    }));
  }, [historyItems]);

  const historyColumns = useMemo<ColumnDef<VendorRatingHistoryItem>[]>(() => {
    const infoPoColumn: ColumnDef<VendorRatingHistoryItem> = {
      accessorKey: 'source',
      header: ratingLabels.COLUMNS.INFO_PO,
      size: 320,
      meta: {
        cellClassName: 'whitespace-normal align-top',
      },
      cell: ({ row }) => {
        const item = row.original;
        const sourceHref = getVendorRatingSourceHref(item.source);
        const sourceLabel = formatVendorRatingSourceLabel(item.source);

        return (
          <div className="space-y-0.5">
            {sourceHref ? (
              <Link
                href={sourceHref}
                className="block max-w-full font-medium text-brand-600 underline-offset-2 hover:underline"
              >
                {sourceLabel}
              </Link>
            ) : (
              <span
                className={cn(
                  'block max-w-full font-medium',
                  item.source.deleted && 'text-slate-500'
                )}
              >
                {sourceLabel}
              </span>
            )}
            <p className="text-xs text-slate-500">
              {formatVendorRatingDateTime(item.ratedAt)} · {item.ratedBy?.name ?? '-'} ·{' '}
              {formatVendorRatingValue(item.overallScore)}
            </p>
          </div>
        );
      },
    };

    const categoryColumns: ColumnDef<VendorRatingHistoryItem>[] = ratingCategoryColumns.map(
      (column) => ({
        id: column.code,
        header: column.label,
        size: 160,
        meta: {
          cellClassName: 'align-top',
        },
        cell: ({ row }) => {
          const score = row.original.scores.find((entry) => entry.categoryCode === column.code);

          if (!score) {
            return <span className="text-sm text-slate-400">-</span>;
          }

          return (
            <p className="text-sm font-medium text-slate-900">
              {formatVendorRatingValue(score.score)}
            </p>
          );
        },
      })
    );

    return [infoPoColumn, ...categoryColumns];
  }, [ratingCategoryColumns]);

  const handlePaginationChange = (nextPage: number, nextPerPage: number) => {
    setPage(nextPage);
    setPerPage(nextPerPage);
  };

  const historySearch = (
    <div className="px-4 py-4">
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
    <div className="flex flex-col gap-6">
      <section className=" bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">{ratingLabels.HISTORY_TITLE}</h2>
            <p className="text-sm text-slate-500">
              Cari rating vendor berdasarkan Info PO, penilai, atau skor.
            </p>
          </div>
        </div>

        {isHistoryError ? (
          <div className="flex min-h-32 items-center justify-center px-6 py-10 text-sm text-destructive">
            Gagal memuat history rating. Coba lagi.
          </div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden">
            <DataTableLayout<VendorRatingHistoryItem, unknown>
              columns={historyColumns}
              data={filteredHistoryItems}
              isLoading={isHistoryLoading}
              enablePagination={true}
              emptyMessage={hasActiveFilters ? ratingLabels.EMPTY_FILTERED : ratingLabels.EMPTY}
              initialPage={historyMeta?.currentPage ?? page}
              initialPageSize={historyMeta?.perPage ?? perPage}
              totalItems={historyTotalItems}
              totalPages={historyTotalPages}
              onPaginationChange={handlePaginationChange}
              pageSizeOptions={[10, 20, 50]}
              filter={historySearch}
              filterClassName="border-b border-slate-200"
              className="border-0 rounded-none shadow-none"
            />
          </div>
        )}
      </section>
    </div>
  );
}
