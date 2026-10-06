export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  /** Route to navigate to on click; omitted when there is no known target */
  targetPath?: string;
}

export interface NotificationDrawerProps {
  open: boolean;
  notifications: Notification[];
  unreadCount: number;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
  /** Infinite scroll: whether more pages are available */
  hasMore?: boolean;
  /** Infinite scroll: whether the next page is currently being fetched */
  isFetchingMore?: boolean;
  /** Infinite scroll: called when the list is scrolled near the bottom */
  onLoadMore?: () => void;
}
