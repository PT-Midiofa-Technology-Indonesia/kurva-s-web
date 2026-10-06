'use client';

import { AlertTriangle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import type { PerformanceAction } from '../types';

interface RewardPunishmentBadgeProps {
  action: PerformanceAction;
  type: 'reward' | 'punishment';
  className?: string;
}

export function RewardPunishmentBadge({ action, type, className }: RewardPunishmentBadgeProps) {
  const isReward = type === 'reward';
  const Icon = isReward ? Trophy : AlertTriangle;
  const colorClass = isReward
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-red-100 text-red-700 border-red-200';

  return (
    <Badge variant="outline" className={cn(colorClass, 'gap-1.5', className)}>
      <Icon className="h-3 w-3" />
      <span>{action.title}</span>
    </Badge>
  );
}
