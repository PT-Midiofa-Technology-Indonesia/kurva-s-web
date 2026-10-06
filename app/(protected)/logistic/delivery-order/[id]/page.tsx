import { Suspense } from 'react';

import { DoDetailPage } from '@/domains/logistic';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <DoDetailPage />
    </Suspense>
  );
}
