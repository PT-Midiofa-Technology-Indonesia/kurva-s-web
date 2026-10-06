'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs } from '@/shared/components/molecules/Tabs';
import type { TabItem } from '@/shared/components/molecules/Tabs/types';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import {
  BOQ_MANAGEMENT_TAB_LABELS,
  BOQ_MANAGEMENT_TABS,
  type BOQManagementTab,
} from '../constants';
import { BOQExecutionListPage } from './BOQExecutionListPage';
import { BOQFinalListPage } from './BOQFinalListPage';
import { BOQPlanningListPage } from './BOQPlanningListPage';
import { BOQTemplatePage } from './BOQTemplatePage';

interface BOQManagementUrlParams extends BaseQueryParams {
  tab?: string;
}

export function BOQManagementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { queryParams } = useQueryParams<BOQManagementUrlParams>();
  const activeTab =
    (queryParams.tab as BOQManagementTab | undefined) ?? BOQ_MANAGEMENT_TABS.TEMPLATE;

  const handleTabChange = (tabKey: string) => {
    const tab = tabKey as BOQManagementTab;
    const params = new URLSearchParams(searchParams.toString());
    if (tab === BOQ_MANAGEMENT_TABS.TEMPLATE) params.delete('tab');
    else params.set('tab', tab);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const tabItems: TabItem[] = [
    {
      key: BOQ_MANAGEMENT_TABS.TEMPLATE,
      label: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.TEMPLATE],
      content: <BOQTemplatePage />,
      remountOnChange: true,
    },
    {
      key: BOQ_MANAGEMENT_TABS.PLANNING,
      label: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.PLANNING],
      content: <BOQPlanningListPage />,
      remountOnChange: true,
    },
    {
      key: BOQ_MANAGEMENT_TABS.FINAL,
      label: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.FINAL],
      content: <BOQFinalListPage />,
      remountOnChange: true,
    },
    {
      key: BOQ_MANAGEMENT_TABS.EXECUTION,
      label: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.EXECUTION],
      content: <BOQExecutionListPage />,
      remountOnChange: true,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Tabs items={tabItems} activeKey={activeTab} onChange={handleTabChange} />
    </div>
  );
}
