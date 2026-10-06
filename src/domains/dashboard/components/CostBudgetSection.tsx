'use client';

import { BarChart3, Building2, Target, TrendingUp, Wallet } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from '@/components/ui';
import { formatCurrencyIDR } from '@/shared/utils/format';
import { cn } from '@/utils/cn';
import { DASHBOARD_LABELS } from '../constants';
import { useDashboardFinanceSummary } from '../hooks/use-dashboard-finance-summary';
import { formatPercent } from '../services/format';
import {
  MetricCard,
  SectionError,
  SectionHeader,
  SummaryCardGridSkeleton,
} from './DashboardSectionUI';

export function CostBudgetSection({ companyId }: { companyId: string }) {
  const { data, error, isPending, refetch } = useDashboardFinanceSummary(companyId);

  return (
    <>
      <SectionHeader
        description={DASHBOARD_LABELS.COST_BUDGET.DESCRIPTION}
        title={DASHBOARD_LABELS.COST_BUDGET.TITLE}
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
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              detail={DASHBOARD_LABELS.COST_BUDGET.DETAIL_RAB}
              icon={Building2}
              label={DASHBOARD_LABELS.COST_BUDGET.METRIC_RAB}
              tone="slate"
              value={formatCurrencyIDR(data.rabValue)}
            />
            <MetricCard
              detail={
                data.potentialMarginPercentage === null
                  ? '--'
                  : `${formatPercent(data.potentialMarginPercentage)} ${DASHBOARD_LABELS.COMMON.OF_RAB_SUFFIX}`
              }
              icon={TrendingUp}
              label={DASHBOARD_LABELS.COST_BUDGET.METRIC_POTENTIAL_MARGIN}
              tone="green"
              value={formatCurrencyIDR(data.potentialMarginValue)}
            />
            <MetricCard
              detail={
                data.budgetUtilization === null
                  ? '--'
                  : `${formatPercent(data.budgetUtilization)} ${DASHBOARD_LABELS.COMMON.USED_SUFFIX}`
              }
              icon={Wallet}
              label={DASHBOARD_LABELS.COST_BUDGET.METRIC_CURRENT_BUDGET}
              tone="brand"
              value={formatCurrencyIDR(data.currentBudgetValue)}
            />
            <MetricCard
              detail={DASHBOARD_LABELS.COST_BUDGET.DETAIL_ACTUAL_COST}
              icon={BarChart3}
              label={DASHBOARD_LABELS.COST_BUDGET.METRIC_ACTUAL_COST}
              tone="amber"
              value={formatCurrencyIDR(data.actualValue)}
            />
            <MetricCard
              detail={
                data.remainingPercentage === null
                  ? '--'
                  : `${formatPercent(data.remainingPercentage)} ${DASHBOARD_LABELS.COMMON.AVAILABLE_SUFFIX}`
              }
              icon={Target}
              label={DASHBOARD_LABELS.COST_BUDGET.METRIC_REMAINING_BUDGET}
              tone={data.remainingValue < 0 ? 'red' : 'sky'}
              value={formatCurrencyIDR(data.remainingValue)}
            />
          </div>

          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-950">
                    {DASHBOARD_LABELS.COST_BUDGET.UTILIZATION_TITLE}
                  </CardTitle>
                  <CardDescription>
                    {DASHBOARD_LABELS.COST_BUDGET.UTILIZATION_DESCRIPTION}
                  </CardDescription>
                </div>
                <Badge
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    data.budgetUtilization !== null && data.budgetUtilization >= 80
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-green-200 bg-green-50 text-green-700'
                  )}
                  variant="outline"
                >
                  {data.budgetUtilization === null
                    ? '--'
                    : `${formatPercent(data.budgetUtilization)} used`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress className="h-2 bg-slate-200" value={data.budgetUtilization ?? 0} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  {formatCurrencyIDR(data.actualValue)} {DASHBOARD_LABELS.COMMON.USED_LABEL}
                </span>
                <span>
                  {formatCurrencyIDR(data.remainingValue)} {DASHBOARD_LABELS.COMMON.REMAINING_LABEL}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
