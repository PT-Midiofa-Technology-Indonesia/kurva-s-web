'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCompanyId } from '@/domains/procurement/hooks/use-company-id';
import { AsyncSelect } from '@/shared/components/atoms';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { useDeliveryOrderSourceTypes } from '@/shared/hooks/use-enums';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { DeliveryOrderForm } from '../components/DeliveryOrderForm';
import { useCreateDeliveryOrder } from '../hooks/use-create-delivery-order';
import type { CreateDeliveryOrderPayload } from '../types/delivery-order-form';

export function DoCreatePage() {
  const router = useRouter();
  const companyId = useCompanyId();
  const createMutation = useCreateDeliveryOrder();

  const [sourceType, setSourceType] = useState('purchase_order');
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const { data: sourceTypeOptions = [], isLoading: isLoadingSourceTypes } =
    useDeliveryOrderSourceTypes();

  // Redirect ke list jika tidak ada companyId
  useEffect(() => {
    if (!companyId) {
      router.push('/logistic/delivery-order');
    }
  }, [companyId, router]);

  const handleCancel = useCallback(() => {
    router.push('/logistic/delivery-order');
  }, [router]);

  const handleSubmit = useCallback(
    (payload: CreateDeliveryOrderPayload) => {
      setServerErrors({});
      createMutation.mutate(
        { payload: { ...payload, companyId: companyId ?? '' }, companyId },
        {
          onSuccess: () => {
            toast.success('Delivery Order berhasil dibuat');
            router.push('/logistic/delivery-order');
          },
          onError: (error) => {
            const fieldErrors = getFieldErrors(error) ?? {};
            setServerErrors(fieldErrors);
            toast.error(getErrorMessage(error, 'Gagal membuat Delivery Order'));
          },
        }
      );
    },
    [companyId, createMutation, router]
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Tambah Delivery Order"
        onBack={handleCancel}
        actions={
          <div className="w-64">
            <AsyncSelect
              options={sourceTypeOptions}
              placeholder="Source Type"
              isLoading={isLoadingSourceTypes}
              value={sourceType || null}
              onChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                setSourceType(val || '');
              }}
            />
          </div>
        }
      />

      <DeliveryOrderForm
        sourceType={sourceType}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        onCancel={handleCancel}
        serverErrors={serverErrors}
      />
    </div>
  );
}
