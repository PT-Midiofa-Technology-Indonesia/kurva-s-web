'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import { useMe } from '@/domains/auth/hooks/use-me';
import { Tabs } from '@/shared/components/molecules';
import { TAX_REPORT_LABELS } from '../constants';

export type TaxTabKey = 'tax-report' | 'tax-filing';

interface TaxManagementTabsProps {
  children: React.ReactNode;
}

const TAB_ORDER: TaxTabKey[] = ['tax-report', 'tax-filing'];

const TAB_REQUIRED_PERMISSIONS: Record<TaxTabKey, string> = {
  'tax-report': 'fin.taxr',
  'tax-filing': 'fin.taxf',
};

export function TaxManagementTabs({ children }: TaxManagementTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user, isPending: isMePending } = useMe();

  const userPermissions = user?.permissions;
  const visibleTabs = useMemo(() => {
    const permissions = userPermissions ?? [];
    return TAB_ORDER.filter((tab) => permissions.includes(TAB_REQUIRED_PERMISSIONS[tab]));
  }, [userPermissions]);

  const rawTab = searchParams.get('tab') as TaxTabKey | null;
  const currentTab: TaxTabKey = rawTab === 'tax-filing' ? 'tax-filing' : 'tax-report';

  const activeVisibleTab = visibleTabs.includes(currentTab)
    ? currentTab
    : (visibleTabs[0] ?? 'tax-report');

  if (isMePending || visibleTabs.length === 0) {
    return null;
  }

  const handleChange = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'tax-report') params.delete('tab');
    else params.set('tab', key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const childPages = React.Children.toArray(children);
  const taxReportContent = childPages[0] ?? null;
  const taxFilingContent = childPages[1] ?? taxReportContent;

  const tabItems = [
    visibleTabs.includes('tax-report') && {
      key: 'tax-report',
      label: TAX_REPORT_LABELS.TABS.TAX_REPORT,
      content: taxReportContent,
    },
    visibleTabs.includes('tax-filing') && {
      key: 'tax-filing',
      label: TAX_REPORT_LABELS.TABS.TAX_FILING,
      content: taxFilingContent,
    },
  ].filter(Boolean) as { key: string; label: string; content: React.ReactNode }[];

  return (
    <Tabs
      activeKey={activeVisibleTab}
      onChange={handleChange}
      contentClassName="pt-4"
      tabListClassName="px-6 py-2"
      items={tabItems}
    />
  );
}
