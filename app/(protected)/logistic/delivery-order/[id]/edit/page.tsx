import { Suspense } from 'react';

import { DoEditPage } from '@/domains/logistic/pages/DoEditPage';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <DoEditPage />
    </Suspense>
  );
}
