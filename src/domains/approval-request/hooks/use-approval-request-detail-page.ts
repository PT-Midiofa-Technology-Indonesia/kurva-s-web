'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';

import { useApprovalRequest } from './use-approval-request';
import { useApproveApprovalRequest } from './use-approve-approval-request';
import { useRejectApprovalRequest } from './use-reject-approval-request';

export function useApprovalRequestDetailPage(approvalRequestId: string) {
  const router = useRouter();
  const [isRejectDrawerOpen, setIsRejectDrawerOpen] = useState(false);

  const { data, isLoading, isError } = useApprovalRequest(approvalRequestId);
  const approvalRequest = data?.data ?? null;

  const { mutateAsync: approve, isPending: isApproving } =
    useApproveApprovalRequest(approvalRequestId);
  const { mutateAsync: reject, isPending: isRejecting } =
    useRejectApprovalRequest(approvalRequestId);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleApprove = useCallback(async () => {
    try {
      await approve({ comment: '' });
      toast.success({ title: 'Pengajuan berhasil disetujui.' });
    } catch (error) {
      toast.error({ title: getErrorMessage(error) });
    }
  }, [approve]);

  const handleReject = useCallback(
    async (comment: string) => {
      try {
        await reject({ comment });
        setIsRejectDrawerOpen(false);
        toast.success({ title: 'Pengajuan berhasil ditolak.' });
      } catch (error) {
        toast.error({ title: getErrorMessage(error) });
      }
    },
    [reject]
  );

  const canDecide = approvalRequest?.status === 'in_progress';

  return {
    approvalRequest,
    isLoading,
    isError,
    isRejectDrawerOpen,
    setIsRejectDrawerOpen,
    isApproving,
    isRejecting,
    canDecide,
    handleBack,
    handleApprove,
    handleReject,
  };
}
