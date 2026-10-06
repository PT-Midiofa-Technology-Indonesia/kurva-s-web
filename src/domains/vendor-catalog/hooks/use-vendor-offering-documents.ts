'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { createVendorOfferingDocument } from '../api/create-vendor-offering-document';
import { deleteVendorOfferingDocument } from '../api/delete-vendor-offering-document';
import type { GetVendorOfferingDocumentsParams } from '../api/get-vendor-offering-documents';
import { getVendorOfferingDocuments } from '../api/get-vendor-offering-documents';
import { updateVendorOfferingDocument } from '../api/update-vendor-offering-document';
import { VENDOR_OFFERING_DOCUMENT_QUERY_KEY } from './use-vendor-offering-document';

const QUERY_KEY = 'vendor-offering-documents';

export function useVendorOfferingDocuments(params?: GetVendorOfferingDocumentsParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVendorOfferingDocuments(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateVendorOfferingDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendorOfferingDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED('Offering Document') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}

export function useUpdateVendorOfferingDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateVendorOfferingDocument>[1];
    }) => updateVendorOfferingDocument(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [VENDOR_OFFERING_DOCUMENT_QUERY_KEY, variables.id],
      });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Offering Document') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}

export function useDeleteVendorOfferingDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendorOfferingDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED('Offering Document') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
