'use client';

import { SegmentedControl } from '@/shared/components/atoms';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import {
  STOCK_MONITORING_TAB_LABELS,
  STOCK_MONITORING_TABS,
  type StockMonitoringTab,
} from '../constants';
import { StockEquipmentTab } from './StockEquipmentTab';
import { StockMaterialTab } from './StockMaterialTab';

interface StockMonitoringUrlParams extends BaseQueryParams {
  tab?: string;
}

const VISIBLE_TABS = [STOCK_MONITORING_TABS.MATERIAL, STOCK_MONITORING_TABS.EQUIPMENT] as const;

export function StockMonitoringPage() {
  const { queryParams, updateQueryParam } = useQueryParams<StockMonitoringUrlParams>();
  const activeTab = (queryParams.tab as StockMonitoringTab) || STOCK_MONITORING_TABS.MATERIAL;

  const handleTabChange = (tab: StockMonitoringTab) => {
    updateQueryParam('tab', tab === STOCK_MONITORING_TABS.MATERIAL ? undefined : tab);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center px-3 h-12 border-b border-slate-200">
        <nav className="flex flex-row items-center gap-1">
          <SegmentedControl
            options={VISIBLE_TABS.map((tab) => ({
              value: tab,
              label: STOCK_MONITORING_TAB_LABELS[tab],
            }))}
            value={activeTab}
            onChange={(value) => handleTabChange(value as StockMonitoringTab)}
          />
        </nav>
      </div>

      {activeTab === STOCK_MONITORING_TABS.MATERIAL && <StockMaterialTab />}
      {activeTab === STOCK_MONITORING_TABS.EQUIPMENT && <StockEquipmentTab />}
    </div>
  );
}
