'use client';

import { X } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/atoms';
import type { FormFieldConfig } from '@/components/organisms/FormGenerator';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';

import { APPROVAL_REQUEST_LABELS } from '../constants';
import { type ApprovalDecisionFormValues, approvalDecisionSchema } from '../schemas';

const FORM_ID = 'reject-approval-form';
const labels = APPROVAL_REQUEST_LABELS.REJECT_DRAWER;

interface ApprovalRequestRejectDrawerProps {
  open: boolean;
  isSubmitting: boolean;
  onSubmit: (comment: string) => void;
  onClose: () => void;
}

export function ApprovalRequestRejectDrawer({
  open,
  isSubmitting,
  onSubmit,
  onClose,
}: ApprovalRequestRejectDrawerProps) {
  const fields = useMemo<FormFieldConfig<ApprovalDecisionFormValues>[]>(
    () => [
      {
        name: 'comment',
        type: 'textarea',
        label: labels.REASON_LABEL,
        placeholder: labels.REASON_PLACEHOLDER,
        required: true,
        colSpan: 12,
      },
    ],
    []
  );

  const handleSubmit = (values: ApprovalDecisionFormValues) => {
    onSubmit(values.comment);
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
              {labels.TITLE}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <FormGenerator
            key={open ? 'open' : 'closed'}
            id={FORM_ID}
            schema={approvalDecisionSchema}
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={{ comment: '' }}
          />
        </div>

        <DrawerFooter className="border-t px-4 py-4">
          <Button
            type="submit"
            form={FORM_ID}
            variant="destructive"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? labels.SUBMITTING : labels.SUBMIT}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {labels.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
