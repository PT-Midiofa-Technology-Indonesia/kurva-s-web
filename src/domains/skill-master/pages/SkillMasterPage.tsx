'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useMe } from '@/domains/auth/hooks/use-me';
import { SegmentedControl } from '@/shared/components/atoms';
import { PermissionGuard } from '@/shared/components/molecules';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import {
  SKILL_MASTER_TAB_LABELS,
  SKILL_MASTER_TAB_REQUIRED_PERMISSIONS,
  SKILL_MASTER_TABS,
  type SkillMasterTab,
} from '../constants';
import { SkillCatalogListContent } from './SkillCatalogListContent';
import { SkillCategoryListContent } from './SkillCategoryListContent';
import { SkillLevelListContent } from './SkillLevelListContent';

interface SkillMasterUrlParams extends BaseQueryParams {
  tab?: string;
}

const TAB_ORDER: SkillMasterTab[] = [
  SKILL_MASTER_TABS.SKILL_LEVEL,
  SKILL_MASTER_TABS.SKILL_CATEGORY,
  SKILL_MASTER_TABS.SKILL,
];

export function SkillMasterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user, isPending: isMePending } = useMe();
  const { queryParams } = useQueryParams<SkillMasterUrlParams>();
  const userPermissions = user?.permissions;

  const visibleTabs = useMemo(() => {
    const permissions = userPermissions ?? [];
    return TAB_ORDER.filter((tab) =>
      permissions.includes(SKILL_MASTER_TAB_REQUIRED_PERMISSIONS[tab])
    );
  }, [userPermissions]);

  const defaultTab = visibleTabs[0] ?? SKILL_MASTER_TABS.SKILL_LEVEL;
  const activeTab = (queryParams.tab as SkillMasterTab | undefined) ?? defaultTab;
  const activeVisibleTab = visibleTabs.includes(activeTab) ? activeTab : visibleTabs[0];

  useEffect(() => {
    if (isMePending) return;
    if (visibleTabs.length === 0) return;

    if (activeTab !== activeVisibleTab && activeVisibleTab) {
      const params = new URLSearchParams(searchParams.toString());
      if (activeVisibleTab === SKILL_MASTER_TABS.SKILL_LEVEL) {
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

  const handleTabChange = (tab: SkillMasterTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === SKILL_MASTER_TABS.SKILL_LEVEL) params.delete('tab');
    else params.set('tab', tab);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center px-3 py-2 gap-4 border-b border-slate-200">
        <nav className="flex items-center gap-1">
          <SegmentedControl
            options={visibleTabs.map((tab) => ({
              value: tab,
              label: SKILL_MASTER_TAB_LABELS[tab],
            }))}
            value={activeVisibleTab}
            onChange={(value) => handleTabChange(value as SkillMasterTab)}
          />
        </nav>
      </div>

      {activeVisibleTab === SKILL_MASTER_TABS.SKILL_LEVEL && (
        <PermissionGuard
          requiredPermission={SKILL_MASTER_TAB_REQUIRED_PERMISSIONS[SKILL_MASTER_TABS.SKILL_LEVEL]}
        >
          <SkillLevelListContent />
        </PermissionGuard>
      )}

      {activeVisibleTab === SKILL_MASTER_TABS.SKILL_CATEGORY && (
        <PermissionGuard
          requiredPermission={
            SKILL_MASTER_TAB_REQUIRED_PERMISSIONS[SKILL_MASTER_TABS.SKILL_CATEGORY]
          }
        >
          <SkillCategoryListContent />
        </PermissionGuard>
      )}

      {activeVisibleTab === SKILL_MASTER_TABS.SKILL && (
        <PermissionGuard
          requiredPermission={SKILL_MASTER_TAB_REQUIRED_PERMISSIONS[SKILL_MASTER_TABS.SKILL]}
        >
          <SkillCatalogListContent />
        </PermissionGuard>
      )}
    </div>
  );
}
