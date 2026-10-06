import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { PurchaseOrderListPage } from '@/domains/procurement';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PurchaseOrderListPage />
    </Suspense>
  );
}
