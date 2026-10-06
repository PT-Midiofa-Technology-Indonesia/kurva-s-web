'use client';

import { CircleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui';
import { useMe } from '@/domains/auth';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { usePortal } from '@/shared/hooks/use-portal';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { DashboardHero } from '../components/DashboardHero';
import {
  HeroSkeleton,
  KpiCardGridSkeleton,
  PortfolioSectionSkeleton,
  SummaryCardGridSkeleton,
  TableCardSkeleton,
} from '../components/DashboardSectionUI';
import { DASHBOARD_LABELS } from '../constants';
import { CompanyDashboardPage } from './CompanyDashboardPage';
import { ProjectDashboardPage } from './ProjectDashboardPage';

export function DashboardPage() {
  const { data: user, isPending: isMePending } = useMe();
  useQueryParams<{
    companyId?: string;
  }>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const { portal, isPortalResolved } = usePortal();

  const role = user?.roles[0]?.name ?? DASHBOARD_LABELS.ROLE_FALLBACK;
  const userName = user?.name ?? '';

  if (!isPortalResolved || isMePending) {
    return <DashboardLoadingSkeleton />;
  }

  if (portal === 'project') {
    return <ProjectDashboardPage role={role} userName={userName} />;
  }

  if (!companyId) {
    return <DashboardUnavailablePage role={role} userName={userName} />;
  }

  return (
    <CompanyDashboardPage
      companyId={companyId}
      companyOptions={companyOptions}
      onCompanyChange={handleCompanyChange}
      role={role}
      userName={userName}
    />
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <HeroSkeleton />
      <SummaryCardGridSkeleton count={5} />
      <PortfolioSectionSkeleton />
      <SummaryCardGridSkeleton count={5} />
      <KpiCardGridSkeleton />
      <TableCardSkeleton />
    </div>
  );
}

function DashboardUnavailablePage({ role, userName }: { role: string; userName: string }) {
  return (
    <div className="space-y-6 p-6">
      <DashboardHero role={role} userName={userName} />
      <Alert variant="destructive">
        <CircleAlert className="h-4 w-4" />
        <AlertTitle>{DASHBOARD_LABELS.COMMON.UNAVAILABLE_TITLE}</AlertTitle>
        <AlertDescription>{DASHBOARD_LABELS.COMMON.UNAVAILABLE_DESCRIPTION}</AlertDescription>
      </Alert>
    </div>
  );
}
