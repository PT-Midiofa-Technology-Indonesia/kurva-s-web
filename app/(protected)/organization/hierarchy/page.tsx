import { Suspense } from 'react';

import { HierarchyManagementListPage } from '@/domains/hierarchy-management';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <HierarchyManagementListPage />
    </Suspense>
  );
}
