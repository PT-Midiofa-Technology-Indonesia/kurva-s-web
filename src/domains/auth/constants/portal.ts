import { Briefcase, Building2, ChevronRight } from 'lucide-react';
import type { PortalType } from '@/shared/lib/portal';
import type { Workspace } from '../types';

export interface PortalCardMeta {
  label: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  chevronIcon: React.ComponentType<{ className?: string }>;
}

export interface PortalCardData extends PortalCardMeta {
  id: string;
  code: PortalType;
}

/**
 * Presentation-only metadata (icon/copy) per workspace code — the API
 * doesn't provide these, so they're kept in the frontend and merged
 * with the fetched workspace list.
 */
export const PORTAL_CARD_META: Record<PortalType, PortalCardMeta> = {
  company: {
    label: 'Masuk ke',
    title: 'Portal Company',
    icon: Building2,
    chevronIcon: ChevronRight,
  },
  project: {
    label: 'Masuk ke',
    title: 'Portal Project',
    icon: Briefcase,
    chevronIcon: ChevronRight,
  },
};

export function toPortalCards(workspaces: Workspace[]): PortalCardData[] {
  return workspaces
    .filter((workspace) => workspace.isActive && workspace.code in PORTAL_CARD_META)
    .map((workspace) => ({
      id: workspace.id,
      code: workspace.code,
      ...PORTAL_CARD_META[workspace.code],
    }));
}
