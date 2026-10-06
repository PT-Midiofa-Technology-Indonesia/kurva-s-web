import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { ActionItemPage } from '@/domains/action-item';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ActionItemPage />
    </Suspense>
  );
}
