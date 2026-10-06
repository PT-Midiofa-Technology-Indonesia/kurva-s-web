'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import { toTitleCase } from '@/shared/utils/string';
import { VENDOR_DIRECTORY_LABELS } from '../constants';
import { useVendorServiceCoverages } from '../hooks';
import type { VendorDirectoryServiceCoverage } from '../types';

export function VendorDirectoryServiceCoverageList() {
  const { data, isLoading, isError } = useVendorServiceCoverages();

  const items = useMemo(() => {
    return (data?.data ?? []) as unknown as VendorDirectoryServiceCoverage[];
  }, [data?.data]);

  const columns = useMemo<ColumnDef<VendorDirectoryServiceCoverage>[]>(
    () => [
      {
        id: 'vendor',
        header: VENDOR_DIRECTORY_LABELS.SERVICE_COVERAGE.COLUMNS.VENDOR,
        size: 220,
        enableSorting: false,
        cell: ({ row }) => row.original.vendor?.name ?? '-',
      },
      {
        accessorKey: 'province',
        header: VENDOR_DIRECTORY_LABELS.SERVICE_COVERAGE.COLUMNS.PROVINCE,
        size: 200,
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.original.province ? toTitleCase(row.original.province.name) : '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'cities',
        header: VENDOR_DIRECTORY_LABELS.SERVICE_COVERAGE.COLUMNS.CITY,
        size: 280,
        enableSorting: false,
        cell: ({ row }) => {
          const cities = row.original.cities ?? [];
          if (cities.length === 0) {
            return (
              <Badge variant="secondary" className="font-normal">
                Semua kota
              </Badge>
            );
          }
          return (
            <div className="flex flex-wrap gap-1">
              {cities.map((city) => (
                <Badge key={city.id ?? city.name} variant="secondary" className="font-normal">
                  {toTitleCase(city.name)}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: 'status',
        header: VENDOR_DIRECTORY_LABELS.SERVICE_COVERAGE.COLUMNS.STATUS,
        size: 140,
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{VENDOR_DIRECTORY_LABELS.COMMON.STATUS_ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{VENDOR_DIRECTORY_LABELS.COMMON.STATUS_INACTIVE}</Badge>
          ),
      },
    ],
    []
  );

  return (
    <ListPageTemplate<VendorDirectoryServiceCoverage>
      title={VENDOR_DIRECTORY_LABELS.SERVICE_COVERAGE.TITLE}
      data={items}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={VENDOR_DIRECTORY_LABELS.SERVICE_COVERAGE.EMPTY}
      enablePagination={false}
    />
  );
}
