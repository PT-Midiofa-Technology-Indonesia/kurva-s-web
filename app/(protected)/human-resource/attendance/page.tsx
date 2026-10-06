import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { AttendanceListPage } from '@/domains/attendance';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <AttendanceListPage />
    </Suspense>
  );
}
