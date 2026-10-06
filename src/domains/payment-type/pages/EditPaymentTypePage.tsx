'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { PaymentTypeForm } from '../components/PaymentTypeForm';
import { PAYMENT_TYPE_LABELS } from '../constants';
import { useEditPaymentTypePage } from '../hooks/use-edit-payment-type-page';

export function EditPaymentTypePage() {
  const { id: paymentTypeId } = useParams<{ id: string }>();
  const {
    paymentType,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditPaymentTypePage(paymentTypeId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!paymentType) {
    return <ItemNotFound message={PAYMENT_TYPE_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={PAYMENT_TYPE_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <PaymentTypeForm
        mode="edit"
        paymentType={paymentType}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={PAYMENT_TYPE_LABELS.EDIT.DIALOG.TITLE}
        description={PAYMENT_TYPE_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={PAYMENT_TYPE_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={PAYMENT_TYPE_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
