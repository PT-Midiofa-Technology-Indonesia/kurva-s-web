import { Suspense } from 'react';
import { LoginPage } from '@/domains/auth';
import { LoadingSkeleton } from '@/shared/components/molecules';

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="card" />}>
      <LoginPage />
    </Suspense>
  );
}
