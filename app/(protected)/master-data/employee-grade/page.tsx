import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { EmployeeGradeListPage } from '@/domains/employee-grade';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <EmployeeGradeListPage />
    </Suspense>
  );
}
