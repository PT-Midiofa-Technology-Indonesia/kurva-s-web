'use client';

import { useParams } from 'next/navigation';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import { BOQExecutionDetailPage } from './BOQExecutionDetailPage';
import { BOQFinalPage } from './BOQFinalDetailPage';
import { BOQPlanningPage } from './BOQPlanningDetailPage';
import { BOQTemplateDetailPage } from './BOQTemplateDetailPage';

interface BOQManagementDetailUrlParams extends BaseQueryParams {
  tab?: string;
}

export function BOQManagementDetailRouter() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { queryParams } = useQueryParams<BOQManagementDetailUrlParams>();
  const tab = queryParams.tab;

  if (tab === 'planning') {
    return <BOQPlanningPage projectId={id} initialTab={tab} />;
  }

  if (tab === 'final') {
    return <BOQFinalPage projectId={id} initialTab={tab} />;
  }

  if (tab === 'execution') {
    return <BOQExecutionDetailPage projectId={id} initialTab={tab} />;
  }

  return <BOQTemplateDetailPage initialTab={tab} />;
}
