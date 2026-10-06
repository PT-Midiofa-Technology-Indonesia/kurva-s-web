import { Suspense } from 'react';

import { ListPageSkeleton } from '@/components/templates';
import { CreateMomPage } from '@/domains/mom';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CreateMomPage />
    </Suspense>
  );
}
