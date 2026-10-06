import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { ProjectTypeListPage } from '@/domains/project-type';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ProjectTypeListPage />
    </Suspense>
  );
}
