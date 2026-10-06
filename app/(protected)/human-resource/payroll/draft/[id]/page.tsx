import { Suspense } from 'react';

import { PayrollDraftDetailPage } from '@/domains/payroll';
import { FormPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<FormPageSkeleton fields={6} />}>
      <PayrollDraftDetailPage />
    </Suspense>
  );
}
