import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { TaxFilingDocumentUploadPayload, TaxFilingPayload, TaxFilingPayment } from '../types';

function toFormData(payload: TaxFilingPayload, fileField: 'paymentProof' | 'attachments') {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'files' || key === 'paymentTypeId' || value === undefined || value === null) return;
    formData.append(key, String(value));
  });
  payload.files?.forEach((file, index) => {
    formData.append(`${fileField}[${index}]`, file);
  });
  return formData;
}

function headers(companyId?: string) {
  return companyId ? { 'X-Company-Id': companyId } : undefined;
}

export async function createTaxFilingPayment(
  id: string,
  payload: TaxFilingPayload,
  companyId?: string
) {
  try {
    const { data } = await api.post<ApiSuccessResponse<TaxFilingPayment>>(
      getApiPath(`/finance/tax-filings/${id}/payments`),
      toFormData(payload, 'paymentProof'),
      {
        headers: {
          ...headers(companyId),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function updateTaxFilingPayment(
  id: string,
  paymentId: string,
  payload: TaxFilingPayload,
  companyId?: string
) {
  try {
    const body = toFormData(
      { ...payload, method: 'PUT' } as TaxFilingPayload & { method: string },
      'paymentProof'
    );
    const { data } = await api.post<ApiSuccessResponse<TaxFilingPayment>>(
      getApiPath(`/finance/tax-filings/${id}/payments/${paymentId}`),
      body,
      {
        headers: {
          ...headers(companyId),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function deleteTaxFilingPaymentDocument(
  id: string,
  paymentId: string,
  documentId: string,
  companyId?: string
) {
  try {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      getApiPath(`/finance/tax-filings/${id}/payments/${paymentId}/documents/${documentId}`),
      { headers: headers(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function setTaxFilingInformation(
  id: string,
  payload: TaxFilingPayload,
  companyId?: string
) {
  try {
    const { data } = await api.post<ApiSuccessResponse<unknown>>(
      getApiPath(`/finance/tax-filings/${id}/information`),
      toFormData(payload, 'attachments'),
      {
        headers: {
          ...headers(companyId),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function deleteTaxFilingInformationDocument(
  id: string,
  documentId: string,
  companyId?: string
) {
  try {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      getApiPath(`/finance/tax-filings/${id}/information/documents/${documentId}`),
      { headers: headers(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function uploadTaxFilingDocuments(
  id: string,
  payload: TaxFilingDocumentUploadPayload,
  companyId?: string
) {
  try {
    const formData = new FormData();
    payload.files.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });
    const { data } = await api.post<ApiSuccessResponse<unknown>>(
      getApiPath(`/finance/tax-filings/${id}/documents`),
      formData,
      {
        headers: {
          ...headers(companyId),
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          if (!event.total) return;
          payload.onUploadProgress?.(Math.round((event.loaded * 100) / event.total));
        },
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function deleteTaxFilingDocument(id: string, documentId: string, companyId?: string) {
  try {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      getApiPath(`/finance/tax-filings/${id}/documents/${documentId}`),
      { headers: headers(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
