import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { VendorCatalogListPage } from '@/domains/vendor-catalog';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <VendorCatalogListPage />
    </Suspense>
  );
}
