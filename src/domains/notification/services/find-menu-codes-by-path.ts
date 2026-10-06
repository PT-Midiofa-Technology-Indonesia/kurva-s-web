import type { PortalAwareSectionGroup } from '@/shared/constants/navigation';
import type { MarkNotificationReadPayload } from '../types';

function isPathMatch(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findMenuCodesByPath(
  groups: PortalAwareSectionGroup[],
  pathname: string
): MarkNotificationReadPayload | null {
  for (const group of groups) {
    for (const section of group.sections) {
      if (!section.notificationCode || !section.items) continue;

      for (const item of section.items) {
        if (!item.notificationCode || !item.href) continue;
        if (isPathMatch(pathname, item.href)) {
          return { mainMenuCode: section.notificationCode, submenuCode: item.notificationCode };
        }
      }
    }
  }

  return null;
}
