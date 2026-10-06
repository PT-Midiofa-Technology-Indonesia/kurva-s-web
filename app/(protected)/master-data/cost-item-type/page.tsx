import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { CostItemTypeListPage } from '@/domains/cost-item-type';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CostItemTypeListPage />
    </Suspense>
  );
}
