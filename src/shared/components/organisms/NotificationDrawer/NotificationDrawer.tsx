'use client';

import { Bell, CheckCheck, Loader2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/shared/components/atoms';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { NotificationCard } from './NotificationCard';
import type { NotificationDrawerProps } from './types';

export function NotificationDrawer({
  open,
  notifications,
  unreadCount,
  onClose,
  onNotificationClick,
  onMarkAllRead,
  hasMore = false,
  isFetchingMore = false,
  onLoadMore,
}: NotificationDrawerProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll: observe the bottom sentinel and load the next page
  // when it becomes visible (rootMargin triggers slightly before the end).
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || !onLoadMore || isFetchingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, onLoadMore]);

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="w-full max-w-lg! inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
                Notifications ({notifications.length})
              </DrawerTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                You have {unreadCount} unread notifications
              </p>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden p-3">
          <ScrollArea className="h-full">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-100 space-y-2">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={onNotificationClick}
                  />
                ))}
                {hasMore && (
                  <div ref={sentinelRef} className="flex justify-center py-3">
                    {isFetchingMore && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No notifications</p>
                <p className="text-xs text-slate-400 mt-1">You&apos;re all caught up!</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {notifications.length > 0 && (
          <DrawerFooter className="px-4 py-3 border-t">
            <Button
              variant="outline"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="w-full"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
