import { Suspense } from 'react';

import { BOQDetailPage } from '@/domains/project-control/pages/BOQDetailPage';
import { FormPageSkeleton } from '@/shared/components/templates/FormPageSkeleton';

export default function Page() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <BOQDetailPage />
    </Suspense>
  );
}
