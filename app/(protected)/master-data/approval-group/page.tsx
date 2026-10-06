import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { ApprovalGroupListPage } from '@/domains/approval-group';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ApprovalGroupListPage />
    </Suspense>
  );
}
