import {
  type PortalAwareMenuItem,
  type PortalAwareSection,
  type PortalAwareSectionGroup,
  SIDEBAR_SECTION_GROUPS,
} from '@/shared/constants/navigation';
import { filterSectionGroupsByPermissions } from '@/shared/lib/permission-filter';
import type { PortalType } from '@/shared/lib/portal';

/**
 * The portals an item actually appears in: its own declaration when present,
 * otherwise its section's — never wider than its section's, so an item cannot
 * leak into a portal that its section does not belong to.
 */
export function resolveItemPortals(
  section: Pick<PortalAwareSection, 'portals'>,
  item: PortalAwareMenuItem
): PortalType[] {
  const declared = item.portals ?? section.portals;
  return declared.filter((portal) => section.portals.includes(portal));
}

/**
 * The sidebar tree as a portal sees it. Sections outside the portal are
 * dropped, remaining sections keep only their items for that portal, and a
 * section or group left with nothing to show disappears.
 */
export function filterSectionGroupsByPortal(
  groups: PortalAwareSectionGroup[],
  portal: PortalType
): PortalAwareSectionGroup[] {
  return groups
    .map((group) => ({
      ...group,
      sections: group.sections.reduce<PortalAwareSection[]>((visible, section) => {
        if (!section.portals.includes(portal)) return visible;

        if (!section.items?.length) {
          visible.push(section);
          return visible;
        }

        const items = section.items.filter((item) =>
          resolveItemPortals(section, item).includes(portal)
        );
        if (items.length > 0) visible.push({ ...section, items });

        return visible;
      }, []),
    }))
    .filter((group) => group.sections.length > 0);
}

/** The app's sidebar tree as `portal` sees it. */
export function getPortalSectionGroups(
  portal: PortalType,
  userPermissions?: string[]
): PortalAwareSectionGroup[] {
  let filtered = filterSectionGroupsByPortal(SIDEBAR_SECTION_GROUPS, portal);
  if (userPermissions) {
    filtered = filterSectionGroupsByPermissions(filtered, userPermissions);
  }
  return filtered;
}

function buildAllowedPathPrefixes(portal: PortalType): string[] {
  const menuPaths = getPortalSectionGroups(portal)
    .flatMap((group) => group.sections)
    .flatMap((section) => [section.href, ...(section.items?.map((item) => item.href) ?? [])])
    .filter((href): href is string => Boolean(href));

  // Add detail/sub-routes that might not be directly in the sidebar menu hrefs
  if (portal === 'company') {
    menuPaths.push('/finance/tax-report', '/finance/tax-filing');
  }

  return [...new Set(menuPaths)];
}

/**
 * Path prefixes each portal may reach. Computed once at module load because
 * `proxy.ts` consults this on every request.
 */
export const PORTAL_ALLOWED_PATH_PREFIXES: Record<PortalType, string[]> = {
  company: buildAllowedPathPrefixes('company'),
  project: buildAllowedPathPrefixes('project'),
};
