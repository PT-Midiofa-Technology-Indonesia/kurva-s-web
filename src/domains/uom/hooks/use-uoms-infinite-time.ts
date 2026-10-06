'use client';

import type { UseUomsInfiniteOptions } from './use-uoms-infinite';
import { useUomsInfinite } from './use-uoms-infinite';

export interface UseUomsInfiniteTimeOptions extends Omit<UseUomsInfiniteOptions, 'groupType'> {}

/**
 * Infinite UOM query hook with groupType=time filter (for volume/duration UOMs).
 * Wraps useUomsInfinite and always passes groupType='time'.
 */
export function useUomsInfiniteTime(options?: UseUomsInfiniteTimeOptions) {
  return useUomsInfinite({ ...options, groupType: 'time' });
}
