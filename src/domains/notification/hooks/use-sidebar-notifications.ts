'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import type { PortalAwareSectionGroup } from '@/shared/constants/navigation';
import { applyMenuBadges } from '../services/apply-menu-badges';
import { findMenuCodesByPath } from '../services/find-menu-codes-by-path';
import { useMarkNotificationRead } from './use-mark-notification-read';
import { useMenuBadges } from './use-menu-badges';

function getUnreadCount(
  groups: PortalAwareSectionGroup[],
  mainMenuCode: string,
  submenuCode: string
): number {
  for (const group of groups) {
    for (const section of group.sections) {
      if (section.notificationCode !== mainMenuCode || !section.items) continue;
      const item = section.items.find((i) => i.notificationCode === submenuCode);
      return item?.unreadCount ?? 0;
    }
  }
  return 0;
}

export function useSidebarNotifications(
  groups: PortalAwareSectionGroup[]
): PortalAwareSectionGroup[] {
  const { data: badges } = useMenuBadges();
  const { mutate: markRead } = useMarkNotificationRead();
  const pathname = usePathname();
  const lastMarkedRef = useRef<string | null>(null);

  const decoratedGroups = useMemo(() => applyMenuBadges(groups, badges), [groups, badges]);

  useEffect(() => {
    const codes = findMenuCodesByPath(groups, pathname);
    if (!codes) return;

    const key = `${codes.mainMenuCode}:${codes.submenuCode}`;
    const unread = getUnreadCount(decoratedGroups, codes.mainMenuCode, codes.submenuCode);
    if (unread <= 0 || lastMarkedRef.current === key) return;

    lastMarkedRef.current = key;
    markRead({ payload: codes });
  }, [pathname, groups, decoratedGroups, markRead]);

  return decoratedGroups;
}
