import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { PositionListPage } from '@/domains/position';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PositionListPage />
    </Suspense>
  );
}
