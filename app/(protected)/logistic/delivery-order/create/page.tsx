import { Suspense } from 'react';
import { DoCreatePage } from '@/domains/logistic/pages/DoCreatePage';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <DoCreatePage />
    </Suspense>
  );
}
