'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useMe } from '@/domains/auth/hooks/use-me';
import { SegmentedControl } from '@/shared/components/atoms';
import { PermissionGuard } from '@/shared/components/molecules';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import {
  ITEM_MASTER_TAB_LABELS,
  ITEM_MASTER_TAB_REQUIRED_PERMISSIONS,
  ITEM_MASTER_TABS,
  type ItemMasterTab,
} from '../constants';
import { ItemCatalogTab } from './ItemCatalogTab';
import { ItemCategoryTab } from './ItemCategoryTab';
import { ItemTypeTab } from './ItemTypeTab';

interface ItemMasterUrlParams extends BaseQueryParams {
  tab?: string;
}

const TAB_ORDER: ItemMasterTab[] = [
  ITEM_MASTER_TABS.ITEM_TYPE,
  ITEM_MASTER_TABS.ITEM_CATEGORY,
  ITEM_MASTER_TABS.ITEM_CATALOG,
];

export function ItemMasterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user, isPending: isMePending } = useMe();
  const { queryParams } = useQueryParams<ItemMasterUrlParams>();
  const userPermissions = user?.permissions;

  const visibleTabs = useMemo(() => {
    const permissions = userPermissions ?? [];
    return TAB_ORDER.filter((tab) =>
      permissions.includes(ITEM_MASTER_TAB_REQUIRED_PERMISSIONS[tab])
    );
  }, [userPermissions]);

  const defaultTab = visibleTabs[0] ?? ITEM_MASTER_TABS.ITEM_TYPE;
  const activeTab = (queryParams.tab as ItemMasterTab | undefined) ?? defaultTab;
  const activeVisibleTab = visibleTabs.includes(activeTab) ? activeTab : visibleTabs[0];

  useEffect(() => {
    if (isMePending) return;
    if (visibleTabs.length === 0) return;

    if (activeTab !== activeVisibleTab && activeVisibleTab) {
      const params = new URLSearchParams(searchParams.toString());
      if (activeVisibleTab === ITEM_MASTER_TABS.ITEM_TYPE) {
        params.delete('tab');
      } else {
        params.set('tab', activeVisibleTab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [
    activeTab,
    activeVisibleTab,
    isMePending,
    pathname,
    router,
    searchParams,
    visibleTabs.length,
  ]);

  if (isMePending) {
    return null;
  }

  if (visibleTabs.length === 0) {
    return null;
  }

  const handleTabChange = (tab: ItemMasterTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === ITEM_MASTER_TABS.ITEM_TYPE) params.delete('tab');
    else params.set('tab', tab);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center px-3 h-12 border-b border-slate-200">
        <nav className="flex flex-row items-center gap-1">
          <SegmentedControl
            options={visibleTabs.map((tab) => ({
              value: tab,
              label: ITEM_MASTER_TAB_LABELS[tab],
            }))}
            value={activeVisibleTab}
            onChange={(value) => handleTabChange(value as ItemMasterTab)}
          />
        </nav>
      </div>

      {activeVisibleTab === ITEM_MASTER_TABS.ITEM_TYPE && (
        <PermissionGuard
          requiredPermission={ITEM_MASTER_TAB_REQUIRED_PERMISSIONS[ITEM_MASTER_TABS.ITEM_TYPE]}
        >
          <ItemTypeTab />
        </PermissionGuard>
      )}
      {activeVisibleTab === ITEM_MASTER_TABS.ITEM_CATEGORY && (
        <PermissionGuard
          requiredPermission={ITEM_MASTER_TAB_REQUIRED_PERMISSIONS[ITEM_MASTER_TABS.ITEM_CATEGORY]}
        >
          <ItemCategoryTab />
        </PermissionGuard>
      )}
      {activeVisibleTab === ITEM_MASTER_TABS.ITEM_CATALOG && (
        <PermissionGuard
          requiredPermission={ITEM_MASTER_TAB_REQUIRED_PERMISSIONS[ITEM_MASTER_TABS.ITEM_CATALOG]}
        >
          <ItemCatalogTab />
        </PermissionGuard>
      )}
    </div>
  );
}
