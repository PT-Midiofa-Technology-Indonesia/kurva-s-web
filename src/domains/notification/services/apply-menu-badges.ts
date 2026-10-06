import type { PortalAwareSectionGroup } from '@/shared/constants/navigation';
import type { MenuBadges } from '../types';

export function applyMenuBadges(
  groups: PortalAwareSectionGroup[],
  badges: MenuBadges | undefined
): PortalAwareSectionGroup[] {
  if (!badges) return groups;

  const submenuCounts = new Map<string, Map<string, number>>();
  for (const mainMenu of badges.mainMenus) {
    const submenus = new Map<string, number>();
    for (const submenu of mainMenu.submenus) {
      submenus.set(submenu.code, submenu.newUpdatesCount);
    }
    submenuCounts.set(mainMenu.code, submenus);
  }

  return groups.map((group) => ({
    ...group,
    sections: group.sections.map((section) => {
      if (!section.notificationCode || !section.items) return section;

      const submenus = submenuCounts.get(section.notificationCode);
      if (!submenus) return section;

      let hasUnread = false;
      const items = section.items.map((item) => {
        const count = item.notificationCode ? submenus.get(item.notificationCode) : undefined;
        if (!count || count <= 0) return item;
        hasUnread = true;
        return { ...item, unreadCount: count };
      });

      if (!hasUnread) return section;
      return { ...section, hasUnread: true, items };
    }),
  }));
}
