import { Suspense } from 'react';
import { FormPageSkeleton } from '@/components/templates';
import { CreateUomPage } from '@/domains/uom';

export default function Page() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <CreateUomPage />
    </Suspense>
  );
}
