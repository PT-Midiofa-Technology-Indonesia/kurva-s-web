'use client';

import { useMemo } from 'react';
import {
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { formatCurrencyIDR } from '@/shared/utils/format';
import { cn } from '@/utils/cn';
import { DASHBOARD_LABELS } from '../constants';
import { useDashboardFinanceRemaining } from '../hooks/use-dashboard-finance-remaining';
import { formatPercent } from '../services/format';
import { EmptyState, SectionError, SectionHeader, TableCardSkeleton } from './DashboardSectionUI';

export function FinanceRemainingSection({ companyId }: { companyId: string }) {
  const { data, error, isPending, refetch } = useDashboardFinanceRemaining(companyId);

  const remainingProjects = useMemo(
    () =>
      [...(data?.projects ?? [])].sort((left, right) => {
        const remainingDelta = left.remainingValue - right.remainingValue;
        if (remainingDelta !== 0) return remainingDelta;
        return left.projectCode.localeCompare(right.projectCode);
      }),
    [data?.projects]
  );

  return (
    <>
      <SectionHeader
        description={DASHBOARD_LABELS.FINANCE_REMAINING.DESCRIPTION}
        title={DASHBOARD_LABELS.FINANCE_REMAINING.TITLE}
      />
      {error ? (
        <SectionError
          error={error}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : isPending || !data ? (
        <TableCardSkeleton />
      ) : (
        <Card className="border-slate-200 shadow-none">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{DASHBOARD_LABELS.FINANCE_REMAINING.TABLE_PROJECT}</TableHead>
                  <TableHead className="text-right">
                    {DASHBOARD_LABELS.FINANCE_REMAINING.TABLE_BUDGET}
                  </TableHead>
                  <TableHead className="text-right">
                    {DASHBOARD_LABELS.FINANCE_REMAINING.TABLE_ACTUAL}
                  </TableHead>
                  <TableHead className="text-right">
                    {DASHBOARD_LABELS.FINANCE_REMAINING.TABLE_REMAINING}
                  </TableHead>
                  <TableHead className="text-right">
                    {DASHBOARD_LABELS.FINANCE_REMAINING.TABLE_UTILIZATION}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remainingProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <EmptyState
                        description={DASHBOARD_LABELS.FINANCE_REMAINING.TABLE_EMPTY_DESCRIPTION}
                        title={DASHBOARD_LABELS.FINANCE_REMAINING.TABLE_EMPTY_TITLE}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  remainingProjects.map((project) => (
                    <TableRow
                      key={project.projectId}
                      className={cn(project.remainingValue < 0 && 'bg-destructive/5')}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-500">
                            {project.projectCode}
                          </p>
                          <p className="text-sm font-medium text-slate-950">
                            {project.projectName}
                          </p>
                          {project.remainingValue < 0 ? (
                            <Badge variant="destructive" className="mt-1">
                              {DASHBOARD_LABELS.FINANCE_REMAINING.OVERRUN}
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyIDR(project.budgetValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyIDR(project.actualValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-medium',
                            project.remainingValue < 0 ? 'text-destructive' : 'text-slate-950'
                          )}
                        >
                          {formatCurrencyIDR(project.remainingValue)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {project.budgetUtilization === null
                          ? '--'
                          : `${formatPercent(project.budgetUtilization)}`}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
