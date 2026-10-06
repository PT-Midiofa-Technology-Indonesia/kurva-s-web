import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { LeaveListPage } from '@/domains/leave';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <LeaveListPage />
    </Suspense>
  );
}
