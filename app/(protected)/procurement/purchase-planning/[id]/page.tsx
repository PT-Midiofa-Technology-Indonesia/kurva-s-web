import { Suspense } from 'react';

import { PurchasePlanningDetailPage } from '@/domains/procurement';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PurchasePlanningDetailPage />
    </Suspense>
  );
}
