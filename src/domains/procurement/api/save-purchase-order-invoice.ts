import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { PurchaseOrderDetail } from '../types/purchase-order-detail';

export interface SavePurchaseOrderInvoiceTaxPayload {
  taxTypeId: string;
  rate: number;
}

export interface SavePurchaseOrderInvoiceDocumentPayload {
  documentTypeId: string;
  files?: File[];
  existingIds?: string[];
}

export interface SavePurchaseOrderInvoicePayload {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceDueDate: string;
  invoiceAmount: number;
  taxInvoiceNumber?: string;
  taxInvoiceDate?: string;
  taxInvoiceStatus?: string;
  taxpayerNpwp?: string;
  taxes: SavePurchaseOrderInvoiceTaxPayload[];
  documents?: SavePurchaseOrderInvoiceDocumentPayload[];
  invoiceDocumentTypeId?: string;
  invoiceDocumentExistingIds?: string[];
  invoiceDocumentFiles?: File[];
  taxDocumentTypeId?: string;
  taxDocumentExistingIds?: string[];
  taxDocumentFiles?: File[];
}

export interface SavePurchaseOrderInvoiceParams {
  id: string;
  companyId?: string;
  isUpdate?: boolean;
  payload: SavePurchaseOrderInvoicePayload;
}

export async function savePurchaseOrderInvoice({
  id,
  companyId,
  isUpdate = false,
  payload,
}: SavePurchaseOrderInvoiceParams): Promise<PurchaseOrderDetail> {
  try {
    const formData = new FormData();
    formData.append('invoiceNumber', payload.invoiceNumber);
    formData.append('invoiceDate', payload.invoiceDate);
    formData.append('invoiceDueDate', payload.invoiceDueDate);
    formData.append('invoiceAmount', String(payload.invoiceAmount));
    if (payload.taxInvoiceNumber) formData.append('taxInvoiceNumber', payload.taxInvoiceNumber);
    if (payload.taxInvoiceDate) formData.append('taxInvoiceDate', payload.taxInvoiceDate);
    if (payload.taxInvoiceStatus) formData.append('taxInvoiceStatus', payload.taxInvoiceStatus);
    if (payload.taxpayerNpwp) formData.append('taxpayerNpwp', payload.taxpayerNpwp);

    payload.taxes.forEach((tax, index) => {
      formData.append(`taxes[${index}][taxTypeId]`, tax.taxTypeId);
      formData.append(`taxes[${index}][rate]`, String(tax.rate));
    });

    if (payload.documents && payload.documents.length > 0) {
      payload.documents.forEach((doc, index) => {
        if (!doc.documentTypeId) return;
        formData.append(`documents[${index}][documentTypeId]`, doc.documentTypeId);
        doc.files?.forEach((file) => {
          formData.append(`documents[${index}][files][]`, file);
        });
        doc.existingIds?.forEach((documentId) => {
          formData.append('existingDocumentIds[]', documentId);
        });
      });
    } else {
      if (payload.invoiceDocumentTypeId) {
        formData.append('documents[0][documentTypeId]', payload.invoiceDocumentTypeId);
        payload.invoiceDocumentFiles?.forEach((file) => {
          formData.append('documents[0][files][]', file);
        });
        payload.invoiceDocumentExistingIds?.forEach((documentId) => {
          formData.append('existingDocumentIds[]', documentId);
        });
      }

      if (payload.taxDocumentTypeId) {
        formData.append('documents[1][documentTypeId]', payload.taxDocumentTypeId);
        payload.taxDocumentFiles?.forEach((file) => {
          formData.append('documents[1][files][]', file);
        });
        payload.taxDocumentExistingIds?.forEach((documentId) => {
          formData.append('existingDocumentIds[]', documentId);
        });
      }
    }

    if (isUpdate) {
      formData.append('_method', 'PUT');
    }

    const { data } = await api.post<ApiSuccessResponse<PurchaseOrderDetail>>(
      getApiPath(`/procurement/purchase-orders/${id}/invoice`),
      formData,
      {
        headers: {
          'Content-Type': undefined,
          ...(companyId ? { 'X-Company-Id': companyId } : {}),
        },
      }
    );

    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
