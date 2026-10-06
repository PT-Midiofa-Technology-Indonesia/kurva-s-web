import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { LeaveSettingsPage } from '@/domains/leave';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <LeaveSettingsPage />
    </Suspense>
  );
}
