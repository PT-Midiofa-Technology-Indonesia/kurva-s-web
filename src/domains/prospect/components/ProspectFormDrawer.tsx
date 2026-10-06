'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Button } from '@/components/atoms';
import type { FormFieldConfig } from '@/components/organisms/FormGenerator';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { useProjectCapabilitiesInfinite } from '@/domains/project-capability';
import { useProjectTypesInfinite } from '@/domains/project-type';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { COMMON_LABELS } from '@/shared/constants';
import { parseDateString } from '@/shared/utils/format';
import { PROSPECT_LABELS } from '../constants';
import { useCreateProspect } from '../hooks/use-create-prospect';
import { useUpdateProspect } from '../hooks/use-update-prospect';
import { type CreateProspectFormValues, createProspectSchema } from '../schemas';
import type { ProspectDetail } from '../types';

const FORM_ID = 'prospect-form';
const labels = PROSPECT_LABELS.DRAWER;

interface ProspectFormDrawerProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  companyLabel?: string;
  project?: ProspectDetail;
}

function ProspectFormDrawer({
  open,
  onClose,
  companyId,
  companyLabel,
  project,
}: ProspectFormDrawerProps) {
  const isEdit = !!project;
  const { mutate: create, isPending: isCreating } = useCreateProspect(companyId);
  const { mutate: update, isPending: isUpdating } = useUpdateProspect(companyId, project?.id ?? '');
  const isPending = isCreating || isUpdating;

  const [minEndDate, setMinEndDate] = useState<Date | undefined>(undefined);
  const onStartChange = useCallback((date: Date | undefined) => {
    setMinEndDate(date);
  }, []);

  const {
    options: projectTypeOptions,
    isLoading: isLoadingProjectTypes,
    hasMore: hasMoreProjectTypes,
    loadMore: loadMoreProjectTypes,
  } = useProjectTypesInfinite({ isActive: true, perPage: 20 });

  const {
    options: projectCapabilityOptions,
    isLoading: isLoadingProjectCapabilities,
    hasMore: hasMoreProjectCapabilities,
    loadMore: loadMoreProjectCapabilities,
  } = useProjectCapabilitiesInfinite({ isActive: true, perPage: 20 });

  const defaultValues = useMemo<CreateProspectFormValues>(
    () =>
      project
        ? {
            title: project.name,
            clientName: project.client?.name ?? '',
            estimatedValue: project.estimatedValue,
            projectStartDate: project.projectStartDate,
            projectEndDate: project.projectEndDate,
            description: project.description ?? '',
            projectTypeId: project.projectType?.id ?? '',
            projectCapabilityIds: project.projectCapabilities?.map((c) => c.id) ?? [],
          }
        : {
            title: '',
            clientName: '',
            estimatedValue: 0,
            projectStartDate: '',
            projectEndDate: '',
            description: '',
            projectTypeId: '',
            projectCapabilityIds: [],
          },
    [project]
  );

  const fields = useMemo<FormFieldConfig<CreateProspectFormValues>[]>(
    () => [
      ...(companyLabel && !isEdit
        ? [
            {
              type: 'custom' as const,
              content: (
                <p className="text-sm text-muted-foreground">
                  {labels.SUBTITLE}{' '}
                  <span className="font-semibold text-foreground">{companyLabel}</span>
                </p>
              ),
              colSpan: 12 as const,
            },
          ]
        : []),
      {
        name: 'title',
        type: 'text',
        label: labels.FIELDS.TITLE,
        placeholder: labels.PLACEHOLDERS.TITLE,
        required: true,
        colSpan: 12,
      },
      {
        name: 'clientName',
        type: 'text',
        label: labels.FIELDS.CLIENT,
        placeholder: labels.PLACEHOLDERS.CLIENT,
        required: true,
        colSpan: 12,
      },
      {
        name: 'estimatedValue',
        type: 'input-currency',
        label: labels.FIELDS.ESTIMATED_VALUE,
        placeholder: labels.PLACEHOLDERS.ESTIMATED_VALUE,
        prefix: 'Rp',
        required: true,
        colSpan: 12,
      },
      {
        name: 'projectStartDate',
        label: labels.FIELDS.PROJECT_START_DATE,
        type: 'date',
        placeholder: labels.PLACEHOLDERS.PROJECT_START_DATE,
        required: true,
        colSpan: 6,
      },
      {
        name: 'projectEndDate',
        label: labels.FIELDS.PROJECT_END_DATE,
        type: 'date',
        placeholder: labels.PLACEHOLDERS.PROJECT_END_DATE,
        required: true,
        colSpan: 6,
        minDate: isEdit ? minEndDate : undefined,
      },
      {
        type: 'custom',
        content: <ProjectStartWatcher onStartChange={onStartChange} />,
        colSpan: 12,
      },
      {
        name: 'projectTypeId',
        type: 'select',
        label: labels.FIELDS.PROJECT_TYPE,
        placeholder: labels.PLACEHOLDERS.PROJECT_TYPE,
        options: projectTypeOptions,
        isLoading: isLoadingProjectTypes,
        required: true,
        isClearable: true,
        onScrollToBottom: hasMoreProjectTypes ? () => loadMoreProjectTypes() : undefined,
        colSpan: 12,
      },
      {
        name: 'projectCapabilityIds',
        type: 'select',
        label: labels.FIELDS.PROJECT_CAPABILITY,
        placeholder: labels.PLACEHOLDERS.PROJECT_CAPABILITY,
        options: projectCapabilityOptions,
        isLoading: isLoadingProjectCapabilities,
        isMulti: true,
        isClearable: true,
        onScrollToBottom: hasMoreProjectCapabilities
          ? () => loadMoreProjectCapabilities()
          : undefined,
        colSpan: 12,
      },
      {
        name: 'description',
        type: 'textarea',
        label: labels.FIELDS.DESCRIPTION,
        placeholder: labels.PLACEHOLDERS.DESCRIPTION,
        colSpan: 12,
      },
    ],
    [
      companyLabel,
      isEdit,
      minEndDate,
      onStartChange,
      projectTypeOptions,
      isLoadingProjectTypes,
      hasMoreProjectTypes,
      loadMoreProjectTypes,
      projectCapabilityOptions,
      isLoadingProjectCapabilities,
      hasMoreProjectCapabilities,
      loadMoreProjectCapabilities,
    ]
  );

  const handleSubmit = (values: CreateProspectFormValues) => {
    if (isEdit && project) {
      update(values, { onSuccess: onClose });
    } else {
      create(values, { onSuccess: onClose });
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && handleClose()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
              {isEdit ? 'Edit Prospect' : labels.CREATE_TITLE}
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
            key={open ? (isEdit ? 'edit' : 'create') : 'closed'}
            id={FORM_ID}
            schema={createProspectSchema}
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
          />
        </div>

        <DrawerFooter className="border-t px-4 py-4">
          <Button type="submit" form={FORM_ID} className="w-full" disabled={isPending}>
            {isPending ? COMMON_LABELS.STATE.SAVING : labels.BUTTONS.SAVE}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleClose}
            disabled={isPending}
          >
            {labels.BUTTONS.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface ProjectStartWatcherProps {
  onStartChange: (date: Date | undefined) => void;
}

function ProjectStartWatcher({ onStartChange }: ProjectStartWatcherProps) {
  const projectStartDate = useWatch({ name: 'projectStartDate' });
  const [lastValue, setLastValue] = useState<string>('');

  useEffect(() => {
    if (projectStartDate !== lastValue) {
      setLastValue(projectStartDate);
      onStartChange(parseDateString(projectStartDate));
    }
  }, [projectStartDate, lastValue, onStartChange]);

  return null;
}

export type { ProspectFormDrawerProps };
export { ProspectFormDrawer };
