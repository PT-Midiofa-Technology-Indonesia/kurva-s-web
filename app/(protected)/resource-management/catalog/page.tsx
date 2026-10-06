import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { ResourceCatalogListPage } from '@/domains/resource-management';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ResourceCatalogListPage />
    </Suspense>
  );
}
