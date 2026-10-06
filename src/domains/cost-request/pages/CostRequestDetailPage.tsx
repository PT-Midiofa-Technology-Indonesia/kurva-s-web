'use client';

import { format } from 'date-fns';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Button } from '@/shared/components/atoms';
import { Badge } from '@/shared/components/ui/badge';
import { CancelCostRequestDialog } from '../components/CancelCostRequestDialog';
import { CostRequestFormModal } from '../components/CostRequestFormModal';
import {
  type CostRequestDisplayItem,
  CostRequestItemAccordionList,
} from '../components/CostRequestItemAccordionList';
import { CostRequestSummaryFooter } from '../components/CostRequestSummaryFooter';
import {
  COST_REQUEST_LABELS,
  COST_REQUEST_STATUS_BADGE,
  COST_REQUEST_TYPE_BADGE,
} from '../constants';
import { useCostRequestDetailPage } from '../hooks/use-cost-request-detail-page';

export function CostRequestDetailPage() {
  const params = useParams<{ id?: string }>();
  const resolvedId = params.id ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') ?? undefined;

  const {
    costRequest,
    isLoading,
    canEdit,
    canCancel,
    isEditModalOpen,
    setIsEditModalOpen,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    handleCancelClick,
    handleCancelConfirm,
    isCancelling,
  } = useCostRequestDetailPage(resolvedId, companyId);

  const displayItems = useMemo<CostRequestDisplayItem[]>(() => {
    if (!costRequest) return [];
    return costRequest.items.map((item) => ({
      key: item.id,
      description: item.description,
      receiptNumber: item.receiptNumber,
      amount: item.amount,
      files: item.proofs.map((proof) => ({
        key: proof.id,
        fileName: proof.fileName,
        fileSize: proof.fileSize,
        url: proof.url,
      })),
    }));
  }, [costRequest]);

  if (isLoading || !costRequest) {
    return <div className="p-6 text-sm text-slate-500">Memuat data...</div>;
  }

  const typeBadge = COST_REQUEST_TYPE_BADGE[costRequest.requestType];
  const statusBadge = COST_REQUEST_STATUS_BADGE[costRequest.status];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold text-slate-950">
            {COST_REQUEST_LABELS.DETAIL.TITLE}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <Button variant="destructive" onClick={handleCancelClick}>
              {COST_REQUEST_LABELS.DETAIL.CANCEL_BUTTON}
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              {COST_REQUEST_LABELS.DETAIL.EDIT_BUTTON}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg font-semibold text-slate-950">{costRequest.code}</span>
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{COST_REQUEST_LABELS.DETAIL.REQUEST_TYPE}</p>
                <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500">{COST_REQUEST_LABELS.DETAIL.PROJECT}</p>
                <p className="text-sm text-slate-950">{costRequest.project?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{COST_REQUEST_LABELS.DETAIL.NAME}</p>
                <p className="text-sm text-slate-950">{costRequest.employee.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{COST_REQUEST_LABELS.DETAIL.DUE_DATE}</p>
                <p className="text-sm text-slate-950">
                  {format(new Date(costRequest.dueDate), 'dd MMM yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{COST_REQUEST_LABELS.DETAIL.REASON}</p>
                <p className="text-sm text-slate-950">{costRequest.reason ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  {COST_REQUEST_LABELS.DETAIL.PAYMENT_METHOD}
                </p>
                <p className="text-sm text-slate-950">{costRequest.paymentMethodLabel}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500">{COST_REQUEST_LABELS.DETAIL.NOTES}</p>
              <p className="text-sm text-slate-950">{costRequest.notes ?? '-'}</p>
            </div>
          </div>

          <div>
            <CostRequestItemAccordionList items={displayItems} readOnly />
          </div>
        </div>

        <div className="mt-6">
          <CostRequestSummaryFooter totalAmount={costRequest.totalAmount} />
        </div>
      </div>

      {isEditModalOpen && (
        <CostRequestFormModal
          open
          onClose={() => setIsEditModalOpen(false)}
          costRequest={costRequest}
          companyId={companyId}
          onSuccess={() => setIsEditModalOpen(false)}
        />
      )}

      <CancelCostRequestDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
      />
    </div>
  );
}
