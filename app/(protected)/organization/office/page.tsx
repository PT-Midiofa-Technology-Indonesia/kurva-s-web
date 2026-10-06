import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { OfficeListPage } from '@/domains/office';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <OfficeListPage />
    </Suspense>
  );
}
