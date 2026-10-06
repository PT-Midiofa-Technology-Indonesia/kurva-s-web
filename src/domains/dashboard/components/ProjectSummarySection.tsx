'use client';

import { AlertTriangle, BadgeCheck, BarChart3, Briefcase, Clock3 } from 'lucide-react';
import { AsyncSelect, type SelectValue } from '@/shared/components/atoms';
import { DASHBOARD_LABELS } from '../constants';
import { useDashboardProjectSummary } from '../hooks/use-dashboard-project-summary';
import { formatCompactCurrency, formatPercent } from '../services/format';
import {
  MetricCard,
  SectionError,
  SectionHeader,
  SummaryCardGridSkeleton,
} from './DashboardSectionUI';

interface ProjectSummarySectionProps {
  companyId: string;
  companyOptions: { value: string; label: string }[];
  onCompanyChange: (value: SelectValue) => void;
}

export function ProjectSummarySection({
  companyId,
  companyOptions,
  onCompanyChange,
}: ProjectSummarySectionProps) {
  const { data, error, isPending, refetch } = useDashboardProjectSummary(companyId);

  return (
    <>
      <SectionHeader
        description={DASHBOARD_LABELS.PROJECT_SUMMARY.DESCRIPTION}
        title={DASHBOARD_LABELS.PROJECT_SUMMARY.TITLE}
        actions={
          <AsyncSelect
            className="w-60"
            options={companyOptions}
            value={companyId ?? null}
            onChange={onCompanyChange}
            placeholder={DASHBOARD_LABELS.PROJECT_SUMMARY.COMPANY_PLACEHOLDER}
            isSearchable={false}
            isClearable={false}
          />
        }
      />
      {error ? (
        <SectionError
          error={error}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : isPending || !data ? (
        <SummaryCardGridSkeleton count={5} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            detail={`${formatCompactCurrency(data.prospectPotentialValue)} ${DASHBOARD_LABELS.COMMON.POTENTIAL_VALUE_SUFFIX}`}
            icon={Briefcase}
            label={DASHBOARD_LABELS.PROJECT_SUMMARY.METRIC_PROSPECT}
            tone="slate"
            value={data.prospectCount.toLocaleString('id-ID')}
          />
          <MetricCard
            detail={`${formatCompactCurrency(data.activeProjectValue)} ${DASHBOARD_LABELS.COMMON.ACTIVE_VALUE_SUFFIX}`}
            icon={BarChart3}
            label={DASHBOARD_LABELS.PROJECT_SUMMARY.METRIC_ACTIVE}
            tone="green"
            value={data.activeProjects.toLocaleString('id-ID')}
          />
          <MetricCard
            detail={
              data.attentionPercentage === null
                ? DASHBOARD_LABELS.COMMON.NO_ACTIVE_PROJECT
                : `${formatPercent(data.attentionPercentage)} ${DASHBOARD_LABELS.COMMON.OF_ACTIVE_PROJECTS}`
            }
            icon={AlertTriangle}
            label={DASHBOARD_LABELS.PROJECT_SUMMARY.METRIC_ATTENTION}
            tone="amber"
            value={data.attentionProjects.toLocaleString('id-ID')}
          />
          <MetricCard
            detail={
              data.delayedPercentage === null
                ? DASHBOARD_LABELS.COMMON.NO_ACTIVE_PROJECT
                : `${formatPercent(data.delayedPercentage)} ${DASHBOARD_LABELS.COMMON.OF_ACTIVE_PROJECTS}`
            }
            icon={Clock3}
            label={DASHBOARD_LABELS.PROJECT_SUMMARY.METRIC_DELAYED}
            tone="red"
            value={data.delayedProjects.toLocaleString('id-ID')}
          />
          <MetricCard
            detail={`${formatCompactCurrency(data.completedYtdValue)} ${DASHBOARD_LABELS.COMMON.COMPLETED_VALUE_SUFFIX}`}
            icon={BadgeCheck}
            label={DASHBOARD_LABELS.PROJECT_SUMMARY.METRIC_COMPLETED}
            tone="sky"
            value={data.completedYtd.toLocaleString('id-ID')}
          />
        </div>
      )}
    </>
  );
}
