import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { DeliveryOrderListPage } from '@/domains/logistic';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <DeliveryOrderListPage type="inbound" />
    </Suspense>
  );
}
