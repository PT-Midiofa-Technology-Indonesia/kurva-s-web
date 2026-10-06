'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Settings } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { toTitleCase } from '@/shared/utils/string';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { useVendorServiceCoveragePage } from '../hooks/use-vendor-service-coverage-page';
import type { VendorServiceCoverage } from '../types';
import { VendorServiceCoverageFormDrawer } from './VendorServiceCoverageFormDrawer';

interface VendorServiceCoverageListProps {
  vendorId: string;
  vendorName: string;
}

export function VendorServiceCoverageList({
  vendorId,
  vendorName,
}: VendorServiceCoverageListProps) {
  const params = useMemo(
    () => ({
      vendorId,
    }),
    [vendorId]
  );

  const {
    items,
    isLoading,
    isError,
    isSaving,
    isDrawerOpen,
    handleAdd,
    handleDrawerClose,
    handleSave,
  } = useVendorServiceCoveragePage({ params });

  const columns = useMemo<ColumnDef<VendorServiceCoverage>[]>(
    () => [
      {
        accessorKey: 'province',
        header: VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.COLUMNS.PROVINCE,
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
        header: VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.COLUMNS.CITY,
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
    ],
    []
  );

  return (
    <>
      <ListPageTemplate<VendorServiceCoverage>
        title={VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.TITLE}
        headerActions={
          <Button onClick={handleAdd} variant={'outline'} leftIcon={<Settings />}>
            {VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.ADD_BUTTON}
          </Button>
        }
        data={items}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.EMPTY}
        enablePagination={false}
      />

      <VendorServiceCoverageFormDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        vendorId={vendorId}
        vendorName={vendorName}
        existingItems={items}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </>
  );
}
