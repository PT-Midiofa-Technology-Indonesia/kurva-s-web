'use client';

import { useMutation } from '@tanstack/react-query';
import { uploadPaymentRequestDocument } from '../api/upload-document';

export function useUploadDocument(paymentRequestId: string) {
  return useMutation({
    mutationFn: ({
      documentTypeId,
      file,
      onUploadProgress,
    }: {
      documentTypeId: string;
      file: File;
      onUploadProgress?: (progress: number) => void;
    }) =>
      uploadPaymentRequestDocument({
        paymentRequestId,
        documentTypeId,
        file,
        onUploadProgress,
      }),
  });
}
