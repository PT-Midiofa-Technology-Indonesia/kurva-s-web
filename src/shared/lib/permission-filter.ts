import type { PortalAwareSectionGroup } from '@/shared/constants/navigation';
import { hasRequiredPermission } from '@/shared/lib/permission-utils';

/**
 * Filter section groups by user permissions
 * Items without requiredPermission are always shown
 * Items with requiredPermission are shown only if user has that permission
 */
export function filterSectionGroupsByPermissions(
  groups: PortalAwareSectionGroup[],
  userPermissions: string[] | null | undefined
): PortalAwareSectionGroup[] {
  return groups
    .map((group) => ({
      ...group,
      sections: group.sections
        .map((section) => ({
          ...section,
          items: section.items?.filter((item) => {
            // No permission required = show
            if (!item.requiredPermission) return true;
            // Has permission = show
            return hasRequiredPermission(item.requiredPermission, userPermissions);
          }),
        }))
        .filter((section) => {
          // Section-level permission check
          if (
            section.requiredPermission &&
            !hasRequiredPermission(section.requiredPermission, userPermissions)
          ) {
            return false;
          }
          // Sections without items (direct links) are always kept
          if (!section.items) return true;
          // Sections with items: keep only if at least one item remains
          return section.items.length > 0;
        }), // Remove empty sections
    }))
    .filter((group) => group.sections.length > 0); // Remove empty groups
}
