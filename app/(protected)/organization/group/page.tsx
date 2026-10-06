import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { GroupListPage } from '@/domains/group';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <GroupListPage />
    </Suspense>
  );
}
