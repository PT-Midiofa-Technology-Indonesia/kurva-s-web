import { Suspense } from 'react';
import { DepartmentListPage } from '@/domains/department';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <DepartmentListPage />
    </Suspense>
  );
}
