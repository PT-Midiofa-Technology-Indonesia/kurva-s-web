import { Suspense } from 'react';

import { PurchaseRequestDetailPage } from '@/domains/procurement';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PurchaseRequestDetailPage />
    </Suspense>
  );
}
