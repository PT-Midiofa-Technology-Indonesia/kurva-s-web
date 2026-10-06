import Cookies from 'js-cookie';

export type PortalType = 'company' | 'project';

const COOKIE_NAME = 'portal-selection';
const COOKIE_OPTIONS = {
  expires: 365, // 1 year
  sameSite: 'lax' as const,
  path: '/',
};

interface PortalData {
  portal: PortalType | null;
  workspaceId: string | null;
}

const EMPTY_PORTAL_DATA: PortalData = { portal: null, workspaceId: null };

function getPortalData(): PortalData {
  try {
    if (typeof window === 'undefined') return EMPTY_PORTAL_DATA;
    const cookie = Cookies.get(COOKIE_NAME);
    if (!cookie) return EMPTY_PORTAL_DATA;

    const data = JSON.parse(cookie);
    return { ...EMPTY_PORTAL_DATA, ...data };
  } catch {
    return EMPTY_PORTAL_DATA;
  }
}

function savePortalData(data: PortalData) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  Cookies.set(COOKIE_NAME, JSON.stringify(data), { ...COOKIE_OPTIONS, secure });
}

export function getPortal(): PortalType | null {
  return getPortalData().portal;
}

export function getWorkspaceId(): string | null {
  return getPortalData().workspaceId;
}

export function setPortal(portal: PortalType, workspaceId: string | null = null) {
  savePortalData({ portal, workspaceId });
}

export function clearPortal() {
  Cookies.remove(COOKIE_NAME);
}
