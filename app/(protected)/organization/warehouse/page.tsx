import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { WarehouseListPage } from '@/domains/warehouse';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <WarehouseListPage />
    </Suspense>
  );
}
