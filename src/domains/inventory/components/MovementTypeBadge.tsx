'use client';

import { Badge } from '@/shared/components/ui';
import { MOVEMENT_TYPE_BADGE_VARIANTS } from '../constants';

export function MovementTypeBadge({ movementType }: { movementType: string }) {
  const variant = MOVEMENT_TYPE_BADGE_VARIANTS[movementType.toLowerCase()] ?? 'secondary';
  return <Badge variant={variant}>{movementType}</Badge>;
}
