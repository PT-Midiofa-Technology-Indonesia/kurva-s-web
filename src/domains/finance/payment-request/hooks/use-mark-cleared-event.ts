'use client';

import { useMutation } from '@tanstack/react-query';
import { markClearedEvent } from '../api/mark-cleared-event';

export function useMarkClearedEvent(paymentRequestId: string) {
  return useMutation({
    mutationFn: (eventId: string) => markClearedEvent(paymentRequestId, eventId),
  });
}
