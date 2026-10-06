import { Suspense } from 'react';

import { ListPageSkeleton } from '@/components/templates';
import { PermissionAwareDashboardLayout } from '@/domains/permission';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionAwareDashboardLayout>
      <Suspense fallback={<ListPageSkeleton />}>{children}</Suspense>
    </PermissionAwareDashboardLayout>
  );
}
