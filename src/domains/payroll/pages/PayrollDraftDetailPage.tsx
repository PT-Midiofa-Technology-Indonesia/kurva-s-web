'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/shared/components/atoms';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  ConfirmDialog,
  ItemNotFound,
  LoadingSkeleton,
  PageHeader,
} from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui';
import { getErrorMessage, getStatusCode } from '@/shared/lib/api-error';
import { cn } from '@/shared/lib/utils';
import { formatCurrencyIDR, formatDate } from '@/shared/utils/format';
import { PayrollDraftPreview } from '../components/PayrollDraftPreview';
import { PayrollDraftSnapshot } from '../components/PayrollDraftSnapshot';
import {
  PAYROLL_DRAFT_STATUS_BADGE,
  PAYROLL_DRAFT_STATUS_BADGE_FALLBACK_CLASS,
  PERIOD_TYPE_OPTIONS,
} from '../constants';
import { usePayrollDraftDetailPage } from '../hooks/use-payroll-draft-detail-page';

export function PayrollDraftDetailPage() {
  const params = useParams<{ id?: string }>();
  const resolvedDraftId = params.id ?? '';
  const router = useRouter();
  const {
    companyId,
    detail,
    preview,
    groupedItems,
    isDraft,
    isGenerated,
    isCancelled,
    confirmationTarget,
    isLoading,
    isError,
    error,
    isPreviewLoading,
    isPreviewError,
    previewError,
    refetchDetail,
    refetchPreview,
    isGenerating,
    isCancelling,
    requestGenerate,
    requestCancel,
    closeConfirmation,
    canDismissConfirmation,
    confirmAction,
  } = usePayrollDraftDetailPage(resolvedDraftId);

  const handleBack = () => {
    const params = new URLSearchParams({ tab: 'draft' });
    if (companyId) params.set('companyId', companyId);
    router.push(`/human-resource/payroll?${params.toString()}`);
  };

  if (!companyId) {
    return (
      <div className="p-6">
        <ItemNotFound
          message="Company tidak tersedia. Buka detail draft dari daftar payroll."
          onBack={handleBack}
        />
      </div>
    );
  }

  if (isLoading) return <FormPageSkeleton fields={6} />;

  if (isError && getStatusCode(error) === 404) {
    return (
      <div className="p-6">
        <ItemNotFound message="Payroll draft tidak ditemukan." onBack={handleBack} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <PageHeader title="Detail Payroll Draft" onBack={handleBack} />
        <Alert variant="destructive">
          <div className="flex flex-col items-start gap-3">
            <div>
              <AlertTitle>Payroll draft gagal dimuat</AlertTitle>
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => refetchDetail()}>
              Coba Lagi
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-6">
        <ItemNotFound message="Payroll draft tidak ditemukan." onBack={handleBack} />
      </div>
    );
  }

  const status = PAYROLL_DRAFT_STATUS_BADGE[detail.status];
  const isMutating = isGenerating || isCancelling;
  const canGenerate = Boolean(
    preview && preview.manpower.length > 0 && !isPreviewLoading && !isPreviewError
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Detail Payroll Draft"
        onBack={handleBack}
        actions={
          !isCancelled ? (
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              {isDraft && (
                <Button
                  type="button"
                  size="sm"
                  onClick={requestGenerate}
                  disabled={isMutating || !canGenerate}
                >
                  Generate
                </Button>
              )}
              {(isDraft || isGenerated) && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={requestCancel}
                  disabled={isMutating}
                >
                  Batalkan Draft
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{detail.code}</CardTitle>
            <Badge
              variant="outline"
              className={cn(
                'rounded-md border-0 font-medium',
                status?.className ?? PAYROLL_DRAFT_STATUS_BADGE_FALLBACK_CLASS
              )}
            >
              {status?.label ?? detail.status}
            </Badge>
            <Badge variant="outline">
              {PERIOD_TYPE_OPTIONS.find((option) => option.value === detail.periodType)?.label ??
                detail.periodType}
            </Badge>
          </div>
          <CardDescription>
            {formatDate(detail.periodStart)} - {formatDate(detail.periodEnd)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Total payroll</dt>
              <dd className="mt-1 font-medium">
                {formatCurrencyIDR(detail.totalAmount === null ? null : Number(detail.totalAmount))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Dibuat oleh</dt>
              <dd className="mt-1 font-medium">{detail.creatorName}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Catatan</dt>
              <dd className="mt-1 whitespace-pre-wrap">{detail.notes || '-'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {isDraft && isPreviewLoading && <LoadingSkeleton variant="card" />}

      {isDraft && isPreviewError && (
        <Alert variant="destructive">
          <div className="flex flex-col items-start gap-3">
            <div>
              <AlertTitle>Preview gagal dimuat</AlertTitle>
              <AlertDescription>{getErrorMessage(previewError)}</AlertDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => refetchPreview()}>
              Coba Lagi
            </Button>
          </div>
        </Alert>
      )}

      {isDraft && preview && <PayrollDraftPreview preview={preview} />}
      {!isDraft && <PayrollDraftSnapshot groups={groupedItems} />}

      <ConfirmDialog
        open={confirmationTarget === 'generate'}
        onOpenChange={(open) => !open && canDismissConfirmation() && closeConfirmation()}
        onCancel={() => canDismissConfirmation() && closeConfirmation()}
        variant="warning"
        title="Generate payroll draft?"
        description="Generate bersifat permanen: rincian payroll akan disimpan sebagai snapshot dan payment request akan dibuat. Koreksi setelahnya hanya dapat dilakukan dengan membatalkan draft dan membuat draft baru."
        cancelText="Kembali"
        confirmText="Ya, Generate"
        onConfirm={confirmAction}
        isLoading={isGenerating}
      />

      <ConfirmDialog
        open={confirmationTarget === 'cancel'}
        onOpenChange={(open) => !open && canDismissConfirmation() && closeConfirmation()}
        onCancel={() => canDismissConfirmation() && closeConfirmation()}
        variant="danger"
        title="Batalkan payroll draft?"
        description="Draft akan berstatus cancelled dan payment request terkait juga dibatalkan. Tindakan ini tidak dapat dibatalkan."
        cancelText="Kembali"
        confirmText="Ya, Batalkan"
        onConfirm={confirmAction}
        isLoading={isCancelling}
      />
    </div>
  );
}
