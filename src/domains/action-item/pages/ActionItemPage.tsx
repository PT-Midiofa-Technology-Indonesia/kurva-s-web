'use client';

import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { Tabs } from '@/shared/components/molecules/Tabs/Tabs';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import type { BaseQueryParams } from '@/types/query-params';
import { ACTION_ITEM_LABELS } from '../constants';
import { QualityControlTab } from './QualityControlTab';
import { TaskControlTab } from './TaskControlTab';

type ActionItemTabValue = 'task-control' | 'quality-control';

interface ActionItemUrlParams extends BaseQueryParams {
  tab?: string;
  companyId?: string;
  qcDecision?: string;
}

function resolveTab(value: string | undefined): ActionItemTabValue {
  return value === 'quality-control' ? 'quality-control' : 'task-control';
}

export function ActionItemPage() {
  const { queryParams, setQueryParams, replaceQueryParams } = useQueryParams<ActionItemUrlParams>();
  const { companyId, companyOptions } = useCompanyFilter();
  const setSelectedCompanyId = useSelectedCompanyStore((s) => s.setSelectedCompanyId);
  const tab = resolveTab(typeof queryParams.tab === 'string' ? queryParams.tab : undefined);

  const resolvedCompanyId = companyId ?? '';

  const handleCompanyChange = (value: string | string[] | null | undefined) => {
    const id = Array.isArray(value) ? value[0] : value;
    if (!id) return;

    // Reset list filters on company switch, but keep the active tab.
    replaceQueryParams({
      companyId: id,
      tab: typeof queryParams.tab === 'string' ? queryParams.tab : 'task-control',
    });
    setSelectedCompanyId(id);
  };

  const handleTabChange = (key: string) => {
    // momId is intentionally preserved: the selected MoM is the same meeting
    // regardless of which tab is showing its tasks. status/qcDecision are
    // cleared — qcDecision only applies to Quality Control, and a status
    // value picked in one tab isn't guaranteed to mean the same filter intent
    // in the other, so both reset on switch.
    setQueryParams({
      tab: key,
      status: undefined,
      qcDecision: undefined,
      page: 1,
    });
  };

  const renderPanelHeader = (title: string) => (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-950">{title}</h1>

      <AsyncSelect
        className="w-40"
        options={companyOptions}
        value={resolvedCompanyId}
        isClearable={false}
        onChange={handleCompanyChange}
      />
    </div>
  );

  const tabItems = [
    {
      key: 'task-control',
      label: ACTION_ITEM_LABELS.TABS.TASK_CONTROL,
      content: (
        <div className="flex flex-col gap-6">
          {renderPanelHeader(ACTION_ITEM_LABELS.TABS.TASK_CONTROL)}
          <TaskControlTab companyId={resolvedCompanyId} />
        </div>
      ),
    },
    {
      key: 'quality-control',
      label: ACTION_ITEM_LABELS.TABS.QUALITY_CONTROL,
      content: (
        <div className="flex flex-col gap-6">
          {renderPanelHeader(ACTION_ITEM_LABELS.TABS.QUALITY_CONTROL)}
          <QualityControlTab companyId={resolvedCompanyId} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col p-6">
      <Tabs
        items={tabItems}
        activeKey={tab}
        onChange={handleTabChange}
        className="px-3"
        contentClassName="pt-8"
      />
    </div>
  );
}
