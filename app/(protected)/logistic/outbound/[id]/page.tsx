import { Suspense } from 'react';

import { DeliveryOrderDetailPage } from '@/domains/logistic';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <DeliveryOrderDetailPage type="outbond" />
    </Suspense>
  );
}
