import { Suspense } from 'react';

import { EditUomPage } from '@/domains/uom';
import { FormPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <EditUomPage />
    </Suspense>
  );
}
