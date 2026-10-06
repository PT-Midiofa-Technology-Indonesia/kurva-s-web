'use client';

import { usePathname } from 'next/navigation';
import type { NavItem } from '@/components/organisms/Navbar';
import { PATH_LABELS, SIDEBAR_SECTION_GROUPS } from '@/shared/constants/navigation';
import { useNavigationStore } from '@/shared/store/navigation';

function segmentToLabel(segment: string): string {
  return (
    PATH_LABELS[segment] ??
    segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}

function isIdSegment(segment: string): boolean {
  if (/^\d+$/.test(segment)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true;
  return false;
}

function findNavItemByHref(href: string): boolean {
  for (const group of SIDEBAR_SECTION_GROUPS) {
    for (const section of group.sections) {
      if (section.href === href) return true;
      if (section.items) {
        const item = section.items.find((i) => i.href === href);
        if (item) return true;
      }
    }
  }
  return false;
}

export function useBreadcrumbs(): NavItem[] {
  const pathname = usePathname();
  const storeOverride = useNavigationStore((s) => s.breadcrumbs);

  if (storeOverride) return storeOverride;

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter((segment) => !isIdSegment(segment));
  return segments.map((segment, index) => {
    const currentPath = `/${segments.slice(0, index + 1).join('/')}`;
    const hasValidNavItem = findNavItemByHref(currentPath);

    const item: NavItem = {
      label: segmentToLabel(segment),
    };

    if (hasValidNavItem) {
      item.href = currentPath;
    }

    return item;
  });
}
