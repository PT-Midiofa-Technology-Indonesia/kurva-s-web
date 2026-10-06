'use client';

import { Check, X } from 'lucide-react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/atoms';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import {
  Badge,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui';
import { ApprovalDetailContent } from '../components/ApprovalDetailContent';
import { ApprovalRequestRejectDrawer } from '../components/ApprovalRequestRejectDrawer';
import {
  APPROVAL_REQUEST_LABELS,
  APPROVAL_REQUEST_STATUS_LABELS,
  APPROVAL_REQUEST_STATUS_VARIANTS,
} from '../constants';
import { useApprovalRequestDetailPage } from '../hooks/use-approval-request-detail-page';
import type { ApprovalRequestStatus } from '../types';

const labels = APPROVAL_REQUEST_LABELS.DETAIL;

function StatusBadge({ status }: { status: ApprovalRequestStatus }) {
  const variant = APPROVAL_REQUEST_STATUS_VARIANTS[status] ?? 'secondary';
  const label = APPROVAL_REQUEST_STATUS_LABELS[status] ?? status;
  return <Badge variant={variant}>{label}</Badge>;
}

function HistoryActionBadge({ action }: { action: string }) {
  if (action === 'approved' || action === 'approve') {
    return <Badge variant="success">Approved</Badge>;
  }
  if (action === 'rejected' || action === 'reject') {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return <Badge variant="secondary">{action}</Badge>;
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-normal text-slate-500">{label}</Label>
      <p className="text-sm font-medium text-slate-950">{value || '-'}</p>
    </div>
  );
}

export function ApprovalRequestDetailPage() {
  const params = useParams<Record<string, string>>();
  const approvalRequestId = params.approvalRequestId;
  const {
    approvalRequest,
    isLoading,
    isRejectDrawerOpen,
    setIsRejectDrawerOpen,
    isApproving,
    isRejecting,
    canDecide,
    handleBack,
    handleApprove,
    handleReject,
  } = useApprovalRequestDetailPage(approvalRequestId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!approvalRequest) {
    return <ItemNotFound message={labels.NOT_FOUND} onBack={handleBack} />;
  }

  const totalSteps = approvalRequest.steps?.length ?? 0;
  const currentStep = approvalRequest.steps?.find(
    (s) => s.stepOrder === approvalRequest.currentStepOrder
  );
  const currentStepsLabel = currentStep
    ? `Step ${String(approvalRequest.currentStepOrder).padStart(2, '0')}/${String(totalSteps).padStart(2, '0')} - ${currentStep.name}`
    : `Step ${approvalRequest.currentStepOrder}`;

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <PageHeader
          title={labels.PAGE_TITLE}
          onBack={handleBack}
          actions={
            canDecide ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-9 px-4 text-sm gap-2"
                  onClick={() => setIsRejectDrawerOpen(true)}
                  disabled={isRejecting}
                >
                  <X className="h-4 w-4" />
                  {labels.BUTTONS.REJECT}
                </Button>
                <Button
                  type="button"
                  className="h-9 px-4 text-sm gap-2 bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={isApproving}
                >
                  <Check className="h-4 w-4" />
                  {labels.BUTTONS.APPROVE}
                </Button>
              </>
            ) : null
          }
        />

        {/* Informasi Pengajuan */}
        <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-6 flex flex-col gap-6">
          <h2 className="text-base font-semibold text-slate-950">
            {labels.SECTIONS.SUBMISSION_INFO}
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <DetailField label={labels.FIELDS.PENGAJU} value={approvalRequest.requestor?.name} />
            <DetailField
              label={labels.FIELDS.DEPARTMENT}
              value={approvalRequest.requestor?.department}
            />
            <DetailField
              label={labels.FIELDS.APPROVAL_REQUEST}
              value={approvalRequest.workflow?.name}
            />
            <DetailField
              label={labels.FIELDS.WAKTU_PENGAJUAN}
              value={approvalRequest.waktuPengajuanFormatted}
            />
            <DetailField label={labels.FIELDS.CURRENT_STEPS} value={currentStepsLabel} />
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-normal text-slate-500">
                {labels.FIELDS.APPLICATION_STATUS}
              </Label>
              <StatusBadge status={approvalRequest.status} />
            </div>
            <DetailField label={labels.FIELDS.COMPANY} value={approvalRequest.company?.name} />
          </div>
        </div>

        {/* Dynamic Detail (from BE `detail` field) */}
        {approvalRequest.detail && (
          <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-6 flex flex-col gap-6">
            <h2 className="text-base font-semibold text-slate-950">{labels.SECTIONS.DETAIL}</h2>
            <ApprovalDetailContent detail={approvalRequest.detail} />
          </div>
        )}

        {/* History Approval */}
        <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-950">{labels.SECTIONS.HISTORY}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{labels.HISTORY_COLUMNS.STEPS}</TableHead>
                <TableHead>{labels.HISTORY_COLUMNS.APPROVER}</TableHead>
                <TableHead>{labels.HISTORY_COLUMNS.TANGGAL}</TableHead>
                <TableHead>{labels.HISTORY_COLUMNS.ACTION}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvalRequest.steps?.map((step) => {
                return (
                  <TableRow key={step.id}>
                    <TableCell className="font-medium">
                      {`Steps ${String(step.stepOrder).padStart(2, '0')}`}
                    </TableCell>
                    <TableCell>{step.decider?.name ?? step.approverName ?? '-'}</TableCell>
                    <TableCell>{step.decidedAt ?? '-'}</TableCell>
                    <TableCell>
                      {step.status !== 'pending' ? (
                        <HistoryActionBadge action={step.status} />
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <ApprovalRequestRejectDrawer
        open={isRejectDrawerOpen}
        isSubmitting={isRejecting}
        onSubmit={handleReject}
        onClose={() => setIsRejectDrawerOpen(false)}
      />
    </>
  );
}
