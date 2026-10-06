'use client';

import { differenceInMinutes } from 'date-fns';
import { HandshakeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTimeWithTz, formatRelativeTime } from '@/shared/utils/format';
import type { Notification } from './types';

interface NotificationCardProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const { title, description, timestamp, isRead } = notification;

  const isRecent = differenceInMinutes(new Date(), new Date(timestamp)) < 5;
  const displayTime = isRecent ? formatRelativeTime(timestamp) : formatDateTimeWithTz(timestamp);

  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={cn(
        'w-full text-left px-4 py-3 rounded-xl flex gap-3 transition-colors',
        'hover:bg-slate-100 cursor-pointer',
        isRead ? 'bg-white border border-slate-200' : 'bg-slate-100'
      )}
    >
      <div className="shrink-0 relative rounded-full bg-black w-11 h-11 flex items-center justify-center">
        <HandshakeIcon color="white" size={20} />
        {!isRead && (
          <span className="absolute -top-0.5 -right-1 w-4 h-4 bg-teal-500 rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm leading-snug', isRead ? 'font-medium' : 'font-semibold')}>
            {title}
          </p>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{description}</p>
        <p className="text-xs text-slate-400 mt-1">{displayTime}</p>
      </div>
    </button>
  );
}
