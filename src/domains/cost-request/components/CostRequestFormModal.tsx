'use client';

import { useMemo, useState } from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import { useEmployeesInfinite } from '@/domains/manpower';
import { useProjectsInfinite } from '@/domains/project-control';
import { AsyncSelect, Button, Input, type SelectValue } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { COST_REQUEST_LABELS, COST_REQUEST_TYPE_BADGE, PAYMENT_METHOD_OPTIONS } from '../constants';
import { useCostRequestFormModal } from '../hooks/use-cost-request-form-modal';
import { useCostRequestItemsBuilder } from '../hooks/use-cost-request-items-builder';
import type { CostRequest, CostRequestType } from '../types';
import { CostRequestItemAccordionList } from './CostRequestItemAccordionList';
import { CostRequestItemStagingRow } from './CostRequestItemStagingRow';
import { CostRequestSummaryFooter } from './CostRequestSummaryFooter';

interface CostRequestFormModalProps {
  open: boolean;
  onClose: () => void;
  companyId?: string;
  onSuccess: () => void;
  /** Create mode: required when `costRequest` is not provided. */
  requestType?: CostRequestType;
  /** Edit mode: passing this switches the dialog into edit mode (requestType/project/employee become read-only). */
  costRequest?: CostRequest;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function getStartOfToday(now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Single dialog shared by Create Cost Request (list page) and Edit Cost
 * Request (detail page) — per product decision, editing reuses this same
 * dialog rather than an inline in-page edit form.
 */
export function CostRequestFormModal({
  open,
  onClose,
  requestType,
  companyId,
  costRequest,
  onSuccess,
}: CostRequestFormModalProps) {
  const isEdit = !!costRequest;
  const effectiveRequestType = costRequest?.requestType ?? requestType ?? 'project';

  const { form, onSubmit, isSubmitting } = useCostRequestFormModal({
    requestType,
    costRequest,
    companyId,
    onSuccess: () => {
      onClose();
      onSuccess();
    },
  });

  const {
    control,
    watch,
    setValue,
    register,
    formState: { errors, isValid },
  } = form;
  const minDueDate = useMemo(() => getStartOfToday(), []);

  const {
    displayItems,
    totalAmount,
    handleAddItem: addItemToRequest,
    handleRemoveItem,
    handleRemoveFile,
  } = useCostRequestItemsBuilder({ control, watch, setValue });
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const handleAddItem = (draft: Parameters<typeof addItemToRequest>[0]) => {
    addItemToRequest(draft);
    setIsItemModalOpen(false);
  };

  const {
    options: projectOptions,
    isLoading: projectsLoading,
    hasMore: projectsHasMore,
    loadMore: projectsLoadMore,
  } = useProjectsInfinite({
    companyId,
    enabled: !!companyId && open && !isEdit && effectiveRequestType === 'project',
  });

  const {
    options: employeeOptions,
    isLoading: employeesLoading,
    hasMore: employeesHasMore,
    loadMore: employeesLoadMore,
  } = useEmployeesInfinite({
    companyId,
    enabled: !!companyId && open && !isEdit,
  });

  const projectSelectOptions = useMemo(() => {
    if (!costRequest?.project) return projectOptions;
    const current = {
      value: costRequest.project.id,
      label: costRequest.project.name,
    };
    if (projectOptions.some((option) => option.value === current.value)) return projectOptions;
    return [current, ...projectOptions];
  }, [projectOptions, costRequest?.project]);

  const employeeSelectOptions = useMemo(() => {
    if (!costRequest?.employee) return employeeOptions;
    const current = {
      value: costRequest.employee.id,
      label: costRequest.employee.name ?? costRequest.employee.code,
    };
    if (employeeOptions.some((option) => option.value === current.value)) return employeeOptions;
    return [current, ...employeeOptions];
  }, [employeeOptions, costRequest?.employee]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-4xl! max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? COST_REQUEST_LABELS.CREATE.EDIT_TITLE : COST_REQUEST_LABELS.CREATE.TITLE}
            <Badge variant={COST_REQUEST_TYPE_BADGE[effectiveRequestType].variant}>
              {COST_REQUEST_TYPE_BADGE[effectiveRequestType].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <FormProvider {...form}>
            <form
              id="cost-request-form"
              onSubmit={onSubmit}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>{COST_REQUEST_LABELS.CREATE.REASON}</Label>
                  <Input {...register('reason')} />
                </div>

                {effectiveRequestType === 'project' && (
                  <div className="space-y-1.5">
                    <Label>{COST_REQUEST_LABELS.CREATE.PROJECT}</Label>
                    <Controller
                      control={control}
                      name="projectId"
                      render={({ field }) => (
                        <AsyncSelect
                          options={projectSelectOptions}
                          value={field.value}
                          onChange={(selected: SelectValue) =>
                            field.onChange((Array.isArray(selected) ? selected[0] : selected) || '')
                          }
                          isSearchable
                          isDisabled={isEdit}
                          isLoading={projectsLoading}
                          onScrollToBottom={projectsHasMore ? () => projectsLoadMore() : undefined}
                          placeholder="Pilih project"
                        />
                      )}
                    />
                    <FieldError message={errors.projectId?.message} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{COST_REQUEST_LABELS.CREATE.EMPLOYEE}</Label>
                    <Controller
                      control={control}
                      name="employeeId"
                      render={({ field }) => (
                        <AsyncSelect
                          options={employeeSelectOptions}
                          value={field.value}
                          onChange={(selected: SelectValue) =>
                            field.onChange((Array.isArray(selected) ? selected[0] : selected) || '')
                          }
                          isSearchable
                          isDisabled={isEdit}
                          isLoading={employeesLoading}
                          onScrollToBottom={
                            employeesHasMore ? () => employeesLoadMore() : undefined
                          }
                          placeholder="Pilih employee"
                        />
                      )}
                    />
                    <FieldError message={errors.employeeId?.message} />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{COST_REQUEST_LABELS.CREATE.DUE_DATE}</Label>
                    <Controller
                      control={control}
                      name="dueDate"
                      render={({ field }) => (
                        <DatePicker
                          mode="single"
                          minDate={minDueDate}
                          value={field.value}
                          onChange={(value) => field.onChange(value ?? null)}
                        />
                      )}
                    />
                    <FieldError message={errors.dueDate?.message} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>{COST_REQUEST_LABELS.CREATE.PAYMENT_METHOD}</Label>
                  <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <AsyncSelect
                        options={PAYMENT_METHOD_OPTIONS}
                        value={field.value}
                        onChange={(selected: SelectValue) =>
                          field.onChange(
                            (Array.isArray(selected) ? selected[0] : selected) || undefined
                          )
                        }
                        isSearchable={false}
                        isClearable={false}
                        placeholder="Pilih metode pembayaran"
                      />
                    )}
                  />
                  <FieldError message={errors.paymentMethod?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label>{COST_REQUEST_LABELS.CREATE.NOTES}</Label>
                  <Textarea rows={3} {...register('notes')} />
                </div>
              </div>

              <div>
                <CostRequestItemAccordionList
                  items={displayItems}
                  onAddItem={() => setIsItemModalOpen(true)}
                  onRemoveItem={handleRemoveItem}
                  onRemoveFile={handleRemoveFile}
                />
                <FieldError message={errors.items?.message as string | undefined} />
              </div>
            </form>
            <CostRequestItemStagingRow
              open={isItemModalOpen}
              onOpenChange={setIsItemModalOpen}
              onAdd={handleAddItem}
            />
          </FormProvider>
        </div>

        <div className="shrink-0 bg-popover px-6 pb-4">
          <CostRequestSummaryFooter
            totalAmount={totalAmount}
            actions={
              <>
                <Button type="button" variant="outline" onClick={onClose}>
                  {COST_REQUEST_LABELS.CREATE.CANCEL_BUTTON}
                </Button>
                <Button type="submit" form="cost-request-form" disabled={isSubmitting || !isValid}>
                  {isEdit ? COST_REQUEST_LABELS.CREATE.SAVE : COST_REQUEST_LABELS.CREATE.SUBMIT}
                </Button>
              </>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
