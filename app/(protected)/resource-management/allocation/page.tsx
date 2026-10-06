import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { ResourceAllocationListPage } from '@/domains/resource-management';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ResourceAllocationListPage />
    </Suspense>
  );
}
