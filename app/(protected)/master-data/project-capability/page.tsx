import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { ProjectCapabilityListPage } from '@/domains/project-capability';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ProjectCapabilityListPage />
    </Suspense>
  );
}
