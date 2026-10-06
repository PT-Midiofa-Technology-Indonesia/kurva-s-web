import { Suspense } from 'react';

import { CostRequestDetailPage } from '@/domains/cost-request';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CostRequestDetailPage />
    </Suspense>
  );
}
