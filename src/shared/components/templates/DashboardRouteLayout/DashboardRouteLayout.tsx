'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLogout } from '@/domains/auth/hooks/use-logout';
import { AUTH_QUERY_KEYS, useMe } from '@/domains/auth/hooks/use-me';
import {
  getNotificationTargetPath,
  useMarkNotificationItemRead,
  useNotifications,
  useReadAllNotifications,
  useSidebarNotifications,
} from '@/domains/notification';
import { ProjectPortalSelect } from '@/shared/components/molecules';
import { NotificationDrawer } from '@/shared/components/organisms';
import type { Notification } from '@/shared/components/organisms/NotificationDrawer/types';
import { AUTH_PATHS, PROFILE_MENU_LABELS } from '@/shared/constants/navigation';
import { getPortalSectionGroups } from '@/shared/constants/portal-routes';
import { getPortal, type PortalType } from '@/shared/lib/portal';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { DashboardLayout } from '../DashboardLayout';

/**
 * DashboardRouteLayout Props
 *
 * @remarks
 * This component uses the props injection pattern to accept user permissions
 * from a parent component. This maintains domain-agnostic shared components
 * while allowing permission-based filtering.
 *
 * The parent component (e.g., PermissionAwareDashboardLayout) is responsible
 * for fetching permissions and passing them here.
 *
 * @param children - React nodes to render in the dashboard content area
 * @param userPermissions - Array of permission codes the user has.
 *                          Defaults to empty array (fail-open) if not provided.
 */
export interface DashboardRouteLayoutProps {
  children: React.ReactNode;
  userPermissions?: string[];
}

/**
 * DashboardRouteLayout Component
 *
 * Renders the dashboard layout with portal-aware sidebar filtering.
 * This is a shared component that should not depend on specific domains.
 * Permission filtering is done via injected props.
 *
 * @component
 * @example
 * // In parent (app layer), fetch permissions and inject:
 * <DashboardRouteLayout userPermissions={userPermissions}>
 *   {children}
 * </DashboardRouteLayout>
 */
export function DashboardRouteLayout({
  children,
  userPermissions = [], // Default empty array (fail-open)
}: DashboardRouteLayoutProps) {
  const router = useRouter();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: user } = useMe();
  const [portal, setPortal] = useState<PortalType | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const {
    data: notificationsResult,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications();
  const { mutate: markNotificationItemRead } = useMarkNotificationItemRead();
  const { mutate: readAllNotifications } = useReadAllNotifications();

  const notifications = useMemo<Notification[]>(
    () =>
      (notificationsResult?.pages ?? []).flatMap((page) =>
        page.items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.message,
          timestamp: item.createdAt,
          isRead: item.isRead,
          targetPath: getNotificationTargetPath(item) ?? undefined,
        }))
      ),
    [notificationsResult?.pages]
  );

  const unreadCount = notificationsResult?.pages[0]?.unreadCount ?? 0;

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) {
        markNotificationItemRead(notification.id);
      }
      if (notification.targetPath) {
        setNotificationDrawerOpen(false);
        router.push(notification.targetPath);
      }
    },
    [markNotificationItemRead, router]
  );

  const handleMarkAllRead = useCallback(() => {
    readAllNotifications();
  }, [readAllNotifications]);

  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const selectedProjectId = useSelectedProjectStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useSelectedProjectStore((s) => s.setSelectedProjectId);
  const queryClient = useQueryClient();

  const isProjectPortal = isMounted && portal === 'project';

  const projects = useMemo(() => user?.projects ?? [], [user?.projects]);

  // Permission filter is applied after portal filter for additive security.
  // If permissions are not available, show all items (fail-open).
  const filteredSectionGroups = useMemo(
    () => (portal ? getPortalSectionGroups(portal, userPermissions) : []),
    [portal, userPermissions]
  );

  const sectionGroupsWithBadges = useSidebarNotifications(filteredSectionGroups);

  // Read cookie only on client side to avoid hydration mismatch
  useEffect(() => {
    setPortal(getPortal());
    setIsMounted(true);
  }, []);

  // Default-select the first project when entering the project portal
  // with no (or a now-invalid) selection.
  useEffect(() => {
    if (!isProjectPortal || projects.length === 0) return;
    const stillValid = selectedProjectId && projects.some((p) => p.id === selectedProjectId);
    if (!stillValid) {
      setSelectedProjectId(projects[0].id);
    }
  }, [isProjectPortal, projects, selectedProjectId, setSelectedProjectId]);

  // Wait for client mount to read cookie
  if (!isMounted) {
    return null;
  }

  const profileItems = [
    {
      label: PROFILE_MENU_LABELS.MY_ACCOUNT,
      onClick: () => router.push(AUTH_PATHS.PROFILE),
    },
    {
      label: PROFILE_MENU_LABELS.PORTAL,
      onClick: () => router.push(AUTH_PATHS.PORTAL_SELECTION),
    },
    {
      label: PROFILE_MENU_LABELS.SETTINGS,
      onClick: () => {},
    },
    {
      label: PROFILE_MENU_LABELS.LOGOUT,
      variant: 'destructive' as const,
      onClick: () => logout(),
      disabled: isLoggingOut,
    },
  ];

  return (
    <>
      <DashboardLayout
        sidebarSectionGroups={sectionGroupsWithBadges}
        navbarProps={{
          profileName: user?.name ?? '',
          profileRole: user?.roles?.[0]?.name ?? '',
          profileItems,
          notificationCount: unreadCount,
          onNotificationClick: () => setNotificationDrawerOpen(true),
          projectSelectorSlot:
            isProjectPortal && projects.length > 0 ? (
              <ProjectPortalSelect
                projects={projects.map((p) => ({ id: p.id, name: p.name }))}
                value={selectedProjectId}
                onChange={async (id) => {
                  setSelectedProjectId(id);
                  await queryClient.refetchQueries({ queryKey: AUTH_QUERY_KEYS.me() });
                }}
              />
            ) : undefined,
        }}
      >
        {children}
      </DashboardLayout>
      <NotificationDrawer
        open={notificationDrawerOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={() => setNotificationDrawerOpen(false)}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={handleMarkAllRead}
        hasMore={hasNextPage}
        isFetchingMore={isFetchingNextPage}
        onLoadMore={handleLoadMore}
      />
    </>
  );
}
