'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { usePaymentRequestDetail } from './use-payment-request-detail';
import { usePrePayCheck } from './use-pre-pay-check';

export function usePaymentRequestDetailPage(paymentRequestId: string, companyId?: string) {
  const router = useRouter();
  const { data, isLoading, isError } = usePaymentRequestDetail({ id: paymentRequestId, companyId });
  const { data: prePayCheckData, isLoading: isPrePayCheckLoading } = usePrePayCheck({
    id: paymentRequestId,
    companyId,
  });
  const paymentRequest = data?.data ?? null;
  const prePayCheck = prePayCheckData?.data ?? null;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    paymentRequest,
    prePayCheck,
    isLoading: isLoading || isPrePayCheckLoading,
    isError,
    handleBack,
  };
}
