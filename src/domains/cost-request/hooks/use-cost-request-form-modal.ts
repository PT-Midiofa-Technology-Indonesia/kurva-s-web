'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ApiErrorClass, getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { COST_REQUEST_LABELS } from '../constants';
import { type CreateCostRequestFormValues, createCostRequestSchema } from '../schemas';
import {
  buildCreateCostRequestFormData,
  buildUpdateCostRequestFormData,
} from '../services/build-cost-request-form-data';
import type { CostRequest, CostRequestType } from '../types';
import { useCreateCostRequest } from './use-create-cost-request';
import { useUpdateCostRequest } from './use-update-cost-request';

export interface UseCostRequestFormModalOptions {
  companyId?: string;
  onSuccess?: () => void;
  /** Create mode: initial request type, chosen via the list page's split button. */
  requestType?: CostRequestType;
  /** Edit mode: presence of this prop switches the modal into edit mode. */
  costRequest?: CostRequest;
}

function toFormValues(
  costRequest: CostRequest | undefined,
  requestType: CostRequestType | undefined
): CreateCostRequestFormValues {
  if (costRequest) {
    return {
      requestType: costRequest.requestType,
      projectId: costRequest.project?.id ?? '',
      employeeId: costRequest.employee.id,
      dueDate: new Date(costRequest.dueDate),
      reason: costRequest.reason ?? '',
      paymentMethod: costRequest.paymentMethod,
      notes: costRequest.notes ?? '',
      items: costRequest.items.map((item) => ({
        id: item.id,
        description: item.description,
        receiptNumber: item.receiptNumber ?? '',
        amount: item.amount,
        notes: item.notes ?? '',
        proofFiles: [],
        existingProofs: item.proofs.map((proof) => ({
          id: proof.id,
          fileName: proof.fileName,
          fileSize: proof.fileSize,
          url: proof.url,
        })),
      })),
    };
  }

  return {
    requestType: requestType ?? 'project',
    projectId: '',
    employeeId: '',
    dueDate: undefined as unknown as Date,
    reason: '',
    paymentMethod: undefined as unknown as CreateCostRequestFormValues['paymentMethod'],
    notes: '',
    items: [],
  };
}

/**
 * Backs the single form/dialog shared by Create Cost Request (list page) and
 * Edit Cost Request (detail page) — per product decision, editing reuses the
 * exact same dialog rather than an inline in-page edit form.
 */
export function useCostRequestFormModal({
  companyId,
  onSuccess,
  requestType,
  costRequest,
}: UseCostRequestFormModalOptions) {
  const isEdit = !!costRequest;
  const { mutateAsync: createCostRequest, isPending: isCreating } = useCreateCostRequest();
  const { mutateAsync: updateCostRequest, isPending: isUpdating } = useUpdateCostRequest();

  const defaultValues = useMemo(
    () => toFormValues(costRequest, requestType),
    [costRequest, requestType]
  );

  const form = useForm<CreateCostRequestFormValues>({
    resolver: zodResolver(createCostRequestSchema) as any,
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form.reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEdit && costRequest) {
        const formData = buildUpdateCostRequestFormData(values);
        await updateCostRequest({ id: costRequest.id, formData, companyId });
        toast.success({ title: COST_REQUEST_LABELS.TOAST.updateSuccess });
        onSuccess?.();
        return;
      }

      const formData = buildCreateCostRequestFormData(values);
      const result = await createCostRequest({ formData, companyId });
      toast.success({ title: COST_REQUEST_LABELS.TOAST.createSuccess(result.code) });
      onSuccess?.();
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          form.setError(field as keyof CreateCostRequestFormValues, { message: messages[0] });
        });
        return;
      }
      if (error instanceof ApiErrorClass) {
        toast.error({ title: error.message });
        return;
      }
      toast.error({ title: getErrorMessage(error, COST_REQUEST_LABELS.TOAST.genericError) });
    }
  });

  return {
    form,
    onSubmit,
    isEdit,
    isSubmitting: isCreating || isUpdating || form.formState.isSubmitting,
  };
}
