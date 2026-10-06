'use client';

import type { SelectValue } from '@/shared/components/atoms';
import { CostBudgetSection } from '../components/CostBudgetSection';
import { DashboardHero } from '../components/DashboardHero';
import { FinanceRemainingSection } from '../components/FinanceRemainingSection';
import { KpiSection } from '../components/KpiSection';
import { PortfolioProgressSection } from '../components/PortfolioProgressSection';
import { ProjectSummarySection } from '../components/ProjectSummarySection';

interface CompanyDashboardPageProps {
  companyId: string;
  companyOptions: { value: string; label: string }[];
  onCompanyChange: (value: SelectValue) => void;
  role: string;
  userName: string;
}

export function CompanyDashboardPage({
  companyId,
  companyOptions,
  onCompanyChange,
  role,
  userName,
}: CompanyDashboardPageProps) {
  return (
    <div className="space-y-6 p-6">
      <DashboardHero role={role} userName={userName} />
      <ProjectSummarySection
        companyId={companyId}
        companyOptions={companyOptions}
        onCompanyChange={onCompanyChange}
      />
      <PortfolioProgressSection companyId={companyId} showRequiresAttention />
      <CostBudgetSection companyId={companyId} />
      <KpiSection companyId={companyId} />
      <FinanceRemainingSection companyId={companyId} />
    </div>
  );
}
