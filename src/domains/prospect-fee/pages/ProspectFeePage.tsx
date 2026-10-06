'use client';

import { useEffect, useMemo } from 'react';
import { AsyncSelect, SegmentedControl } from '@/components/atoms';
import { useMe } from '@/domains/auth/hooks/use-me';
import { useQueryParams } from '@/hooks/use-query-params';
import { PermissionGuard } from '@/shared/components/molecules';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/types/query-params';
import {
  PROSPECT_FEE_LABELS,
  PROSPECT_FEE_TAB_LABELS,
  PROSPECT_FEE_TABS,
  type ProspectFeeTab,
} from '../constants';
import { FeeListContent } from './FeeListContent';
import { SettingFeeListContent } from './SettingFeeListContent';

interface ProspectFeeUrlParams extends BaseQueryParams {
  tab?: string;
  companyId?: string;
}

const TAB_ORDER: ProspectFeeTab[] = [PROSPECT_FEE_TABS.FEE, PROSPECT_FEE_TABS.SETTING_FEE];

const TAB_REQUIRED_PERMISSIONS: Record<ProspectFeeTab, string> = {
  [PROSPECT_FEE_TABS.FEE]: 'prosc.fee.his',
  [PROSPECT_FEE_TABS.SETTING_FEE]: 'prosc.fee.stg',
};

export function ProspectFeePage() {
  const { queryParams, setQueryParams } = useQueryParams<ProspectFeeUrlParams>();
  const { data: user, isPending: isMePending } = useMe();
  const activeTab = (queryParams.tab as ProspectFeeTab) ?? PROSPECT_FEE_TABS.FEE;
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const userPermissions = user?.permissions;

  const visibleTabs = useMemo(() => {
    const permissions = userPermissions ?? [];
    return TAB_ORDER.filter((tab) => permissions.includes(TAB_REQUIRED_PERMISSIONS[tab]));
  }, [userPermissions]);
  const activeVisibleTab = visibleTabs.includes(activeTab) ? activeTab : visibleTabs[0];

  const companies = useMemo(
    () => companyOptions.map((option) => ({ id: option.value as string, name: option.label })),
    [companyOptions]
  );

  useEffect(() => {
    if (isMePending) return;

    if (visibleTabs.length === 0) return;

    if (activeTab !== activeVisibleTab) {
      setQueryParams({
        tab: activeVisibleTab === PROSPECT_FEE_TABS.FEE ? undefined : activeVisibleTab,
        companyId: companyId,
      });
    }
  }, [activeTab, activeVisibleTab, companyId, isMePending, setQueryParams, visibleTabs.length]);

  if (isMePending) {
    return null;
  }

  if (visibleTabs.length === 0) {
    return null;
  }

  const selectedCompanyId = companyId ?? companies[0]?.id ?? '';

  const handleTabChange = (tab: ProspectFeeTab) => {
    setQueryParams({
      tab: tab === PROSPECT_FEE_TABS.FEE ? undefined : tab,
      companyId: selectedCompanyId || undefined,
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <nav className="flex items-center gap-1">
          <SegmentedControl
            options={visibleTabs.map((tab) => ({
              value: tab,
              label: PROSPECT_FEE_TAB_LABELS[tab],
            }))}
            value={activeVisibleTab}
            onChange={(value) => handleTabChange(value as ProspectFeeTab)}
          />
        </nav>

        <AsyncSelect
          className="w-52"
          options={companyOptions}
          value={selectedCompanyId || null}
          onChange={handleCompanyChange}
          placeholder={PROSPECT_FEE_LABELS.COMPANY_PLACEHOLDER}
          isSearchable={false}
          isClearable={false}
        />
      </div>

      {activeVisibleTab === PROSPECT_FEE_TABS.FEE && (
        <PermissionGuard requiredPermission={TAB_REQUIRED_PERMISSIONS[PROSPECT_FEE_TABS.FEE]}>
          <FeeListContent selectedCompanyId={selectedCompanyId} />
        </PermissionGuard>
      )}
      {activeVisibleTab === PROSPECT_FEE_TABS.SETTING_FEE && (
        <PermissionGuard
          requiredPermission={TAB_REQUIRED_PERMISSIONS[PROSPECT_FEE_TABS.SETTING_FEE]}
        >
          <SettingFeeListContent companies={companies} selectedCompanyId={selectedCompanyId} />
        </PermissionGuard>
      )}
    </div>
  );
}
