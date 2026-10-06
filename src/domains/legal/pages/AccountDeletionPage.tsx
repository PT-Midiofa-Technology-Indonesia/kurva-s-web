'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/atoms';
import { Alert } from '@/shared/components/molecules/Alert';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { AccountDeletionForm } from '../components/AccountDeletionForm';
import { DELETE_ACCOUNT_LABELS, LEGAL_PATHS } from '../constants';

const LABELS = DELETE_ACCOUNT_LABELS;

export function AccountDeletionPage() {
  // No backend yet — acknowledged locally. Wire a mutation here once the endpoint exists.
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleBeforeSubmit = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsDialogOpen(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold text-slate-950">{LABELS.PAGE_TITLE}</h1>

        <Alert variant="success">
          <p className="text-sm font-medium">{LABELS.SUCCESS.TITLE}</p>
          <p className="mt-1 text-sm leading-relaxed">{LABELS.SUCCESS.BODY}</p>
        </Alert>

        <div>
          <Link href={LEGAL_PATHS.LOGIN}>
            <Button type="button">{LABELS.BUTTONS.DONE}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-slate-950">{LABELS.PAGE_TITLE}</h1>
        <p className="text-sm leading-relaxed text-slate-700">{LABELS.INTRO}</p>
      </header>

      <Alert variant="warning">
        <p className="text-sm font-medium">{LABELS.WARNING_TITLE}</p>
        <p className="mt-1 text-sm leading-relaxed">{LABELS.WARNING_BODY}</p>
      </Alert>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-slate-950">{LABELS.RETENTION_TITLE}</h2>
        <p className="text-sm leading-relaxed text-slate-700">{LABELS.RETENTION_BODY}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-slate-950">{LABELS.ALTERNATIVE_TITLE}</h2>
        <p className="text-sm leading-relaxed text-slate-700">{LABELS.ALTERNATIVE_BODY}</p>
      </section>

      <AccountDeletionForm onSubmit={handleBeforeSubmit} />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="danger"
        title={LABELS.DIALOG.TITLE}
        description={LABELS.DIALOG.DESCRIPTION}
        cancelText={LABELS.DIALOG.CANCEL}
        confirmText={LABELS.DIALOG.CONFIRM}
        onCancel={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}
