import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { OvertimeSettingsPage } from '@/domains/overtime';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <OvertimeSettingsPage />
    </Suspense>
  );
}
