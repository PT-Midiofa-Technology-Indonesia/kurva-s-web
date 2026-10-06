'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { GoodsReceiptForm } from '../components/GoodsReceiptForm';
import { PROCUREMENT_LABELS } from '../constants';
import { useCompanyId } from '../hooks/use-company-id';
import { useCreateGoodsReceipt } from '../hooks/use-create-goods-receipt';
import type { CreateGoodsReceiptPayload } from '../types/goods-receipt';

const GR_LABELS = PROCUREMENT_LABELS.GOODS_RECEIPT;

export function GoodsReceiptCreatePage() {
  const router = useRouter();
  const companyId = useCompanyId();
  const createMutation = useCreateGoodsReceipt();
  const [externalErrors, setExternalErrors] = useState<Record<string, string[]> | undefined>();

  useEffect(() => {
    if (!companyId) {
      router.push('/procurement/goods-receipt');
    }
  }, [companyId, router]);

  const handleCancel = useCallback(() => {
    router.push('/procurement/goods-receipt');
  }, [router]);

  const handleSubmit = useCallback(
    (payload: CreateGoodsReceiptPayload) => {
      setExternalErrors(undefined);
      createMutation.mutate(
        { payload, companyId },
        {
          onSuccess: (data) => {
            toast.success({ title: 'Goods Receipt berhasil disimpan.' });
            const query = companyId ? `?companyId=${companyId}` : '';
            router.push(`/procurement/goods-receipt/${data.id}${query}`);
          },
          onError: (error: unknown) => {
            const message = getErrorMessage(error);
            const fieldErrors = getFieldErrors(error);
            setExternalErrors(fieldErrors);
            toast.error({ title: message });
          },
        }
      );
    },
    [companyId, createMutation, router]
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={GR_LABELS.FORM.TITLE} onBack={handleCancel} />

      <GoodsReceiptForm
        companyId={companyId}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        onCancel={handleCancel}
        externalErrors={externalErrors}
      />
    </div>
  );
}
