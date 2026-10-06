import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { CostRequestListPage } from '@/domains/cost-request';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CostRequestListPage />
    </Suspense>
  );
}
