import { Suspense } from 'react';

import { PurchaseOrderDetailPage } from '@/domains/procurement';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PurchaseOrderDetailPage />
    </Suspense>
  );
}
