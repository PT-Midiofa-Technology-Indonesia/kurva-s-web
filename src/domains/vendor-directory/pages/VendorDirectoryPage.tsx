'use client';

import { SegmentedControl } from '@/shared/components/atoms';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import { VendorDirectoryCapabilityList } from '../components/VendorDirectoryCapabilityList';
import { VendorDirectoryFleetVehicleList } from '../components/VendorDirectoryFleetVehicleList';
import { VendorDirectoryItemCatalogList } from '../components/VendorDirectoryItemCatalogList';
import { VendorDirectoryOfferingDocumentList } from '../components/VendorDirectoryOfferingDocumentList';
import { VendorDirectoryServiceCoverageList } from '../components/VendorDirectoryServiceCoverageList';
import {
  VENDOR_DIRECTORY_TAB_LABELS,
  VENDOR_DIRECTORY_TAB_ORDER,
  VENDOR_DIRECTORY_TABS,
  type VendorDirectoryTab,
} from '../constants';

interface VendorDirectoryUrlParams extends BaseQueryParams {
  tab?: string;
}

export function VendorDirectoryPage() {
  const { queryParams, updateQueryParam } = useQueryParams<VendorDirectoryUrlParams>();
  const activeTab = (queryParams.tab as VendorDirectoryTab) ?? VENDOR_DIRECTORY_TABS.ITEM_CATALOG;

  const handleTabChange = (tab: VendorDirectoryTab) => {
    updateQueryParam('tab', tab === VENDOR_DIRECTORY_TABS.ITEM_CATALOG ? undefined : tab);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center px-3 h-12 border-b border-slate-200">
        <SegmentedControl
          options={VENDOR_DIRECTORY_TAB_ORDER.map((tab) => ({
            value: tab,
            label: VENDOR_DIRECTORY_TAB_LABELS[tab],
          }))}
          value={activeTab}
          onChange={(value) => handleTabChange(value as VendorDirectoryTab)}
          className="flex-1"
        />
      </div>

      <div>
        {activeTab === VENDOR_DIRECTORY_TABS.ITEM_CATALOG && <VendorDirectoryItemCatalogList />}
        {activeTab === VENDOR_DIRECTORY_TABS.CAPABILITY && <VendorDirectoryCapabilityList />}
        {activeTab === VENDOR_DIRECTORY_TABS.SERVICE_COVERAGE && (
          <VendorDirectoryServiceCoverageList />
        )}
        {activeTab === VENDOR_DIRECTORY_TABS.OFFERING_DOCUMENT && (
          <VendorDirectoryOfferingDocumentList />
        )}
        {activeTab === VENDOR_DIRECTORY_TABS.FLEET && <VendorDirectoryFleetVehicleList />}
      </div>
    </div>
  );
}
