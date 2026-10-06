import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { OvertimeListPage } from '@/domains/overtime';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <OvertimeListPage />
    </Suspense>
  );
}
