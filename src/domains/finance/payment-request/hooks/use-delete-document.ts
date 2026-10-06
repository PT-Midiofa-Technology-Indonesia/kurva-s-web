'use client';

import { useMutation } from '@tanstack/react-query';
import { deletePaymentRequestDocument } from '../api/delete-document';

export function useDeleteDocument(paymentRequestId: string) {
  return useMutation({
    mutationFn: (documentId: string) => deletePaymentRequestDocument(paymentRequestId, documentId),
  });
}
