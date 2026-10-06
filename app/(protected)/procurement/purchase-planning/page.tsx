import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { PurchasePlanningListPage } from '@/domains/procurement';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PurchasePlanningListPage />
    </Suspense>
  );
}
