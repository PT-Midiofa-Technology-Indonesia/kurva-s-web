import { Suspense } from 'react';

import { BOQManagementDetailRouter } from '@/domains/project-control/pages';
import { FormPageSkeleton } from '@/shared/components/templates/FormPageSkeleton';

export default function Page() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <BOQManagementDetailRouter />
    </Suspense>
  );
}
