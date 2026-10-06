import type { PaginationMeta } from '@/types/api';

export interface SubmenuBadge {
  code: string;
  name: string;
  newUpdatesCount: number;
  lastUpdatedAt: string | null;
}

export interface MainMenuBadge {
  code: string;
  name: string;
  hasNotification: boolean;
  submenus: SubmenuBadge[];
}

export interface MenuBadges {
  hasAnyNotification: boolean;
  totalUnreadCount: number;
  assignedCompaniesCount: number;
  mainMenus: MainMenuBadge[];
}

export interface MarkNotificationReadPayload {
  mainMenuCode: string;
  submenuCode: string;
}

export interface MarkNotificationReadResult extends MarkNotificationReadPayload {
  newUpdatesCount: number;
  lastReadAt: string;
}

export type NotificationFilter = 'all' | 'unread';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface GetNotificationsParams {
  filter?: NotificationFilter;
  page?: number;
  perPage?: number;
}

export interface NotificationListResult {
  items: NotificationItem[];
  meta: PaginationMeta;
  unreadCount: number;
}

export interface MarkNotificationItemReadResult {
  notification: NotificationItem;
  unreadCount: number;
}

export interface ReadAllNotificationsResult {
  markedCount: number;
  unreadCount: number;
}
