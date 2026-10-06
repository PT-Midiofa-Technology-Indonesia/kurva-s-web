import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { UomListPage } from '@/domains/uom';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <UomListPage />
    </Suspense>
  );
}
