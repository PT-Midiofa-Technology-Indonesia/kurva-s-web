import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { PurchasePlanningCreatePage } from '@/domains/procurement';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PurchasePlanningCreatePage />
    </Suspense>
  );
}
