import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { JobItemTypeListPage } from '@/domains/job-item-type';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <JobItemTypeListPage />
    </Suspense>
  );
}
