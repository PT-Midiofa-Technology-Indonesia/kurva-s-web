import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { ManpowerListPage } from '@/domains/manpower';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ManpowerListPage />
    </Suspense>
  );
}
