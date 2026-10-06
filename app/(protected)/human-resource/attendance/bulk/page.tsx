import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { BulkAttendancePage } from '@/domains/attendance/components/BulkAttendancePage';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <BulkAttendancePage />
    </Suspense>
  );
}
