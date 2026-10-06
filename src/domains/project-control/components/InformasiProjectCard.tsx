'use client';

import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { formatIDR } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/format';

export interface InformasiProjectCardLabels {
  TITLE: string;
  LABELS: {
    PROJECT_NAME: string;
    PROJECT_TYPE?: string;
    PROJECT_OWNER: string;
    CLIENT: string;
    ESTIMATED_VALUE: string;
    TOTAL_VALUE?: string;
    LIMIT_BUDGET?: string;
    TOTAL_VALUE_CCO?: string;
    PROJECT_PERIOD: string;
    DESCRIPTION: string;
  };
}

export interface InformasiProjectCardData {
  name: string;
  projectType?: { id: string; name: string } | null;
  company?: { name: string } | null;
  client?: { name: string } | null;
  estimatedValue: number;
  projectStartDate: string | null;
  projectEndDate: string | null;
  description?: string | null;
}

export interface InformasiProjectCardFinancials {
  totalValue: number;
  limitBudgetPercentage: number | null;
  totalValueCco: number;
}

interface InformasiProjectCardProps {
  project: InformasiProjectCardData;
  labels: InformasiProjectCardLabels;
  financials?: InformasiProjectCardFinancials;
  defaultOpen?: boolean;
  hideEstimatedValue?: boolean;
}

function formatLimitBudget(totalValue: number, percentage: number | null): string {
  if (percentage === null) {
    return '-';
  }

  const formattedPercentage = percentage.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${formatIDR((totalValue * percentage) / 100)} (${formattedPercentage}%)`;
}

export function InformasiProjectCard({
  project,
  labels,
  financials,
  defaultOpen = true,
  hideEstimatedValue = false,
}: InformasiProjectCardProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors [&[data-state=open]>svg]:rotate-180">
          <h2 className="text-base font-semibold text-slate-900">{labels.TITLE}</h2>
          <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4">
          <div className="mb-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">{labels.LABELS.PROJECT_NAME}</p>
              <p className="text-sm font-medium text-slate-900">{project.name}</p>
            </div>

            {labels.LABELS.PROJECT_TYPE && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{labels.LABELS.PROJECT_TYPE}</p>
                <p className="text-sm font-medium text-slate-900">
                  {project.projectType?.name ?? '-'}
                </p>
              </div>
            )}

            {project.company?.name && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{labels.LABELS.PROJECT_OWNER}</p>
                <p className="text-sm font-medium text-slate-900">{project.company?.name}</p>
              </div>
            )}

            {project.client?.name && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{labels.LABELS.CLIENT}</p>
                <p className="text-sm font-medium text-slate-900">{project.client?.name}</p>
              </div>
            )}

            {financials ? (
              <>
                <div>
                  <p className="text-xs text-slate-500 mb-1">{labels.LABELS.TOTAL_VALUE}</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatIDR(financials.totalValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">{labels.LABELS.LIMIT_BUDGET}</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatLimitBudget(financials.totalValue, financials.limitBudgetPercentage)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">{labels.LABELS.TOTAL_VALUE_CCO}</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatIDR(financials.totalValueCco)}
                  </p>
                </div>
              </>
            ) : !hideEstimatedValue ? (
              <div>
                <p className="text-xs text-slate-500 mb-1">{labels.LABELS.ESTIMATED_VALUE}</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatIDR(project.estimatedValue)}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-xs text-slate-500 mb-1">{labels.LABELS.PROJECT_PERIOD}</p>
              <p className="text-sm font-medium text-slate-900">
                {formatDate(project.projectStartDate ?? '')} -{' '}
                {formatDate(project.projectEndDate ?? '')}
              </p>
            </div>
          </div>

          {project.description && (
            <div>
              <p className="text-xs text-slate-500 mb-1">{labels.LABELS.DESCRIPTION}</p>
              <p className="text-sm font-medium text-slate-900">{project.description}</p>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
