import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTaxFilingPayment,
  deleteTaxFilingDocument,
  deleteTaxFilingInformationDocument,
  deleteTaxFilingPaymentDocument,
  setTaxFilingInformation,
  updateTaxFilingPayment,
  uploadTaxFilingDocuments,
} from '../api/tax-filing-mutations';
import type { TaxFilingDocumentUploadPayload, TaxFilingPayload } from '../types';
import { TAX_FILING_QUERY_KEYS } from './use-tax-filings';

export function useTaxFilingMutations(id: string, companyId?: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: TAX_FILING_QUERY_KEYS.detail(id, companyId) });
  return {
    createPayment: useMutation({
      mutationFn: (payload: TaxFilingPayload) => createTaxFilingPayment(id, payload, companyId),
      onSuccess: invalidate,
    }),
    updatePayment: useMutation({
      mutationFn: ({ paymentId, payload }: { paymentId: string; payload: TaxFilingPayload }) =>
        updateTaxFilingPayment(id, paymentId, payload, companyId),
      onSuccess: invalidate,
    }),
    deletePaymentDocument: useMutation({
      mutationFn: ({ paymentId, documentId }: { paymentId: string; documentId: string }) =>
        deleteTaxFilingPaymentDocument(id, paymentId, documentId, companyId),
      onSuccess: invalidate,
    }),
    setInformation: useMutation({
      mutationFn: (payload: TaxFilingPayload) => setTaxFilingInformation(id, payload, companyId),
      onSuccess: invalidate,
    }),
    deleteInformationDocument: useMutation({
      mutationFn: (documentId: string) =>
        deleteTaxFilingInformationDocument(id, documentId, companyId),
      onSuccess: invalidate,
    }),
    uploadDocuments: useMutation({
      mutationFn: (payload: TaxFilingDocumentUploadPayload) =>
        uploadTaxFilingDocuments(id, payload, companyId),
      onSuccess: invalidate,
    }),
    deleteDocument: useMutation({
      mutationFn: (documentId: string) => deleteTaxFilingDocument(id, documentId, companyId),
      onSuccess: invalidate,
    }),
  };
}
