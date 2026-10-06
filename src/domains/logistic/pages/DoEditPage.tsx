'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCompanyId } from '@/domains/procurement/hooks/use-company-id';
import { PageHeader } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { DeliveryOrderForm } from '../components/DeliveryOrderForm';
import { useDeliveryOrderDetail } from '../hooks/use-delivery-orders';
import { useUpdateDeliveryOrder } from '../hooks/use-update-delivery-order';
import type { CreateDeliveryOrderPayload } from '../types/delivery-order-form';

export function DoEditPage() {
  const params = useParams<{ id?: string }>();
  const id = params.id ?? '';
  const router = useRouter();
  const companyId = useCompanyId();
  const updateMutation = useUpdateDeliveryOrder();
  const { data: detail, isLoading, isError } = useDeliveryOrderDetail(id, companyId);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!companyId) {
      router.push('/logistic/delivery-order');
    }
  }, [companyId, router]);

  const handleBack = useCallback(() => {
    const query = companyId ? `?companyId=${companyId}` : '';
    router.push(`/logistic/delivery-order/${id}${query}`);
  }, [router, id, companyId]);

  const handleSubmit = useCallback(
    (payload: CreateDeliveryOrderPayload) => {
      setServerErrors({});
      updateMutation.mutate(
        { id, payload: { ...payload, companyId: companyId ?? '' }, companyId },
        {
          onSuccess: () => {
            toast.success('Delivery Order berhasil diupdate');
            handleBack();
          },
          onError: (error) => {
            const fieldErrors = getFieldErrors(error) ?? {};
            setServerErrors(fieldErrors);
            toast.error(getErrorMessage(error, 'Gagal mengupdate Delivery Order'));
          },
        }
      );
    },
    [id, companyId, updateMutation, handleBack]
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <FormPageSkeleton />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="p-6">
        <PageHeader title="Edit Delivery Order" onBack={handleBack} />
        <p className="text-sm text-red-500 mt-4">Data tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Edit Delivery Order" onBack={handleBack} />

      <DeliveryOrderForm
        defaultData={detail}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        onCancel={handleBack}
        serverErrors={serverErrors}
      />
    </div>
  );
}
