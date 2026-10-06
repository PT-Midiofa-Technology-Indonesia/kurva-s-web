'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SelectOption } from '@/components/atoms';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { useProjectManpower } from '../hooks/use-project-manpower';
import { useProjectManpowerRating } from '../hooks/use-project-manpower-rating';
import { useRatingCategoriesActive } from '../hooks/use-rating-categories-active';
import { useSaveProjectManpowerRating } from '../hooks/use-save-project-manpower-rating';
import type { ProjectManpowerRatingFormValues } from '../schemas/project-manpower-rating';
import { createProjectManpowerRatingSchema } from '../schemas/project-manpower-rating';
import type {
  ProjectManpowerListItem,
  ProjectManpowerRatingCategory,
  ProjectManpowerRatingEnvelope,
  ProjectManpowerRatingScore,
} from '../types/project-manpower-rating';
import { ProjectManpowerRatingForm } from './ProjectManpowerRatingForm';

interface ProjectManpowerRatingModalProps {
  open: boolean;
  projectId: string;
  initialEmployeeId?: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

function sortCategories(categories: ProjectManpowerRatingCategory[]) {
  return [...categories].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getProjectManpowerRatingScore(
  scores: ProjectManpowerRatingScore[] | undefined,
  category: ProjectManpowerRatingCategory
) {
  const scoreByKey = new Map<string, ProjectManpowerRatingScore>();

  for (const item of scores ?? []) {
    if (item.categoryId) scoreByKey.set(item.categoryId, item);
    if (item.categoryCode) scoreByKey.set(item.categoryCode, item);
  }

  const score = scoreByKey.get(category.id) ?? scoreByKey.get(category.code);

  return score ? { score: score.score, note: score.note } : undefined;
}

export function getProjectManpowerRatingCategories(
  detail: ProjectManpowerRatingEnvelope | null | undefined,
  fallbackCategories: ProjectManpowerRatingCategory[]
) {
  const categories = detail?.activeCategories?.length
    ? detail.activeCategories
    : fallbackCategories;

  return sortCategories(categories);
}

function buildDefaultValues(
  employeeId: string,
  detail: ProjectManpowerRatingEnvelope | null,
  fallbackCategories: ProjectManpowerRatingCategory[] = []
): ProjectManpowerRatingFormValues {
  const activeCategories = getProjectManpowerRatingCategories(detail, fallbackCategories);

  return {
    employeeId,
    ratedAt: detail?.rating?.ratedAt
      ? detail.rating.ratedAt.slice(0, 10)
      : format(new Date(), 'yyyy-MM-dd'),
    overallNote: detail?.rating?.note ?? null,
    categoryScores: activeCategories.map((category) => ({
      categoryId: category.id,
      score: getProjectManpowerRatingScore(detail?.rating?.scores, category)?.score ?? 0,
      note: getProjectManpowerRatingScore(detail?.rating?.scores, category)?.note ?? null,
    })),
  };
}

function buildEmptyValues(initialEmployeeId?: string | null): ProjectManpowerRatingFormValues {
  return {
    employeeId: initialEmployeeId ?? '',
    ratedAt: format(new Date(), 'yyyy-MM-dd'),
    overallNote: null,
    categoryScores: [],
  };
}

function toEmployeeOptions(
  items: Array<{ employee: { id: string; code: string; name: string } | null }>,
  selectedEmployee?: { id: string; code: string; name: string } | null
): SelectOption[] {
  const map = new Map<string, SelectOption>();

  for (const item of items) {
    if (!item.employee) continue;
    map.set(item.employee.id, {
      value: item.employee.id,
      label: `${item.employee.name} (${item.employee.code})`,
    });
  }

  if (selectedEmployee && !map.has(selectedEmployee.id)) {
    map.set(selectedEmployee.id, {
      value: selectedEmployee.id,
      label: `${selectedEmployee.name} (${selectedEmployee.code})`,
    });
  }

  return [...map.values()].sort((left, right) => left.label.localeCompare(right.label));
}

export function getProjectManpowerRatingFallback(
  manpowerItem: ProjectManpowerListItem | null | undefined,
  activeCategories: ProjectManpowerRatingCategory[]
): ProjectManpowerRatingEnvelope | null {
  if (!manpowerItem?.employee) return null;

  return {
    employee: manpowerItem.employee,
    activeCategories,
    rating: manpowerItem.rating,
  };
}

export function shouldShowProjectManpowerRatingLoading(
  selectedEmployeeId: string | null,
  effectiveRatingEnvelope: ProjectManpowerRatingEnvelope | null,
  isRatingError: boolean
): boolean {
  return Boolean(selectedEmployeeId && !effectiveRatingEnvelope && !isRatingError);
}

export function shouldRefreshProjectManpowerRatingForm(
  selectedEmployeeId: string | null,
  detailEmployeeId: string | null | undefined,
  dataUpdatedAt: number
): boolean {
  return Boolean(
    selectedEmployeeId && detailEmployeeId === selectedEmployeeId && dataUpdatedAt > 0
  );
}

export function shouldUseSelectedProjectManpowerRating(
  selectedEmployeeId: string | null,
  hasSelectedEmployee: boolean
): boolean {
  return Boolean(selectedEmployeeId && hasSelectedEmployee);
}

export function ProjectManpowerRatingModal({
  open,
  projectId,
  initialEmployeeId,
  onClose,
  onSaved,
}: ProjectManpowerRatingModalProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [hasSelectedEmployee, setHasSelectedEmployee] = useState(Boolean(initialEmployeeId));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    initialEmployeeId ?? null
  );
  const hasInitializedModal = useRef(false);
  const debouncedEmployeeSearch = useDebounce(employeeSearch, 300);

  const {
    data: manpowerItems = [],
    isLoading: isEmployeeLoading,
    isError: isEmployeeError,
  } = useProjectManpower(
    projectId,
    {
      search: debouncedEmployeeSearch || undefined,
    },
    {
      enabled: open,
    }
  );

  const selectedManpowerItem = useMemo(
    () => manpowerItems.find((item) => item.employee?.id === selectedEmployeeId) ?? null,
    [manpowerItems, selectedEmployeeId]
  );
  const selectedManpower = selectedManpowerItem?.employee ?? null;

  const {
    data: ratingEnvelope,
    isFetching: isRatingRequestLoading,
    isError: isRatingError,
    dataUpdatedAt: ratingDataUpdatedAt,
    refetch: refetchRating,
  } = useProjectManpowerRating(projectId, selectedEmployeeId || null, false);

  const { data: ratingCategories = [] } = useRatingCategoriesActive();
  const fallbackRatingEnvelope = useMemo(
    () => getProjectManpowerRatingFallback(selectedManpowerItem, ratingCategories),
    [ratingCategories, selectedManpowerItem]
  );
  const canUseSelectedEmployee = shouldUseSelectedProjectManpowerRating(
    selectedEmployeeId,
    hasSelectedEmployee
  );
  const effectiveRatingEnvelope = canUseSelectedEmployee
    ? ratingEnvelope?.employee?.id === selectedEmployeeId
      ? ratingEnvelope
      : fallbackRatingEnvelope
    : null;
  const isRatingDataLoading = shouldShowProjectManpowerRatingLoading(
    selectedEmployeeId,
    effectiveRatingEnvelope,
    isRatingError
  );
  const isRatingRefreshing = Boolean(
    selectedEmployeeId && effectiveRatingEnvelope && isRatingRequestLoading && !isRatingError
  );
  const shouldRefreshForm = shouldRefreshProjectManpowerRatingForm(
    selectedEmployeeId,
    ratingEnvelope?.employee?.id,
    ratingDataUpdatedAt
  );

  const selectedEmployeeForOptions = effectiveRatingEnvelope?.employee ?? selectedManpower;
  const employeeOptions = useMemo(
    () => toEmployeeOptions(manpowerItems, selectedEmployeeForOptions),
    [manpowerItems, selectedEmployeeForOptions]
  );

  const activeCategories = useMemo(
    () => getProjectManpowerRatingCategories(effectiveRatingEnvelope, ratingCategories),
    [effectiveRatingEnvelope, ratingCategories]
  );
  const schema = useMemo(
    () => createProjectManpowerRatingSchema(activeCategories.map((category) => category.id)),
    [activeCategories]
  );
  const resolver = useMemo(() => zodResolver(schema) as any, [schema]);
  const title = effectiveRatingEnvelope?.rating ? 'Ubah Rating' : 'Beri Rating';
  const submitLabel = effectiveRatingEnvelope?.rating ? 'Ubah Rating' : 'Beri Rating';

  const form = useForm<ProjectManpowerRatingFormValues>({
    resolver,
    defaultValues: buildEmptyValues(initialEmployeeId),
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!open || !selectedEmployeeId) return;

    let cancelled = false;

    void refetchRating().then(({ data }) => {
      if (cancelled || !data || data.employee?.id !== selectedEmployeeId) return;

      form.reset(buildDefaultValues(selectedEmployeeId, data));
      setServerMessage(null);
    });

    return () => {
      cancelled = true;
    };
  }, [form, open, refetchRating, selectedEmployeeId]);

  useEffect(() => {
    if (!open) {
      hasInitializedModal.current = false;
      return;
    }

    if (hasInitializedModal.current) return;
    hasInitializedModal.current = true;

    const nextEmployeeId = initialEmployeeId ?? '';
    setHasSelectedEmployee(Boolean(initialEmployeeId));
    setSelectedEmployeeId(nextEmployeeId);
    form.reset(buildEmptyValues(initialEmployeeId));
    setServerMessage(null);
    setEmployeeSearch('');
  }, [form, initialEmployeeId, open]);

  useEffect(() => {
    if (!open || !selectedEmployeeId) return;
    if (!effectiveRatingEnvelope?.employee) return;
    if (effectiveRatingEnvelope.employee.id !== selectedEmployeeId) return;

    form.reset(
      buildDefaultValues(
        selectedEmployeeId,
        shouldRefreshForm ? (ratingEnvelope ?? null) : effectiveRatingEnvelope,
        activeCategories
      )
    );
    setServerMessage(null);
  }, [
    effectiveRatingEnvelope,
    form,
    open,
    ratingEnvelope,
    activeCategories,
    selectedEmployeeId,
    shouldRefreshForm,
  ]);

  useEffect(() => {
    if (!open) return;
    setServerMessage(null);
    form.clearErrors();
  }, [form, open]);

  const saveProjectManpowerRatingMutation = useSaveProjectManpowerRating(
    projectId,
    selectedEmployeeId
  );

  const handleSubmit = async (values: ProjectManpowerRatingFormValues) => {
    try {
      setServerMessage(null);
      await saveProjectManpowerRatingMutation.mutateAsync({
        ratedAt: values.ratedAt,
        overallNote: values.overallNote ?? null,
        categoryScores: values.categoryScores.map((item) => ({
          categoryId: item.categoryId,
          score: item.score,
          note: item.note ?? null,
        })),
      });
      onSaved?.();
      onClose();
    } catch (error) {
      const fieldErrors = getFieldErrors(error);

      if (fieldErrors?.employeeId?.length) {
        form.setError('employeeId', {
          type: 'server',
          message: fieldErrors.employeeId[0],
        });
      }

      if (fieldErrors?.ratedAt?.length) {
        form.setError('ratedAt', {
          type: 'server',
          message: fieldErrors.ratedAt[0],
        });
      }

      const categoryMessage = fieldErrors?.categoryScores?.[0];
      if (categoryMessage) {
        setServerMessage(categoryMessage);
        return;
      }

      setServerMessage(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-full flex-col overflow-hidden p-6 sm:max-w-4xl">
        <DialogHeader className="shrink-0 space-y-1">
          <DialogTitle className="text-lg font-semibold text-slate-950">{title}</DialogTitle>
          <p className="text-sm text-slate-500">
            {effectiveRatingEnvelope?.employee
              ? `${effectiveRatingEnvelope.employee.name} (${effectiveRatingEnvelope.employee.code})`
              : 'Pilih manpower untuk memuat rating.'}
          </p>
          {effectiveRatingEnvelope?.rating?.ratedBy?.name && (
            <p className="text-xs text-slate-500">
              Terakhir disimpan oleh {effectiveRatingEnvelope.rating.ratedBy.name}
            </p>
          )}
        </DialogHeader>

        <ProjectManpowerRatingForm
          form={form}
          employeeOptions={employeeOptions}
          isEmployeeLoading={isEmployeeLoading}
          isRatingLoading={isRatingDataLoading}
          isRatingRefreshing={isRatingRefreshing}
          activeCategories={activeCategories}
          submitLabel={submitLabel}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={form.formState.isSubmitting || saveProjectManpowerRatingMutation.isPending}
          serverMessage={
            isEmployeeError
              ? 'Gagal memuat daftar manpower.'
              : isRatingError
                ? 'Gagal memuat detail rating.'
                : serverMessage
          }
          onEmployeeSearchChange={setEmployeeSearch}
          onEmployeeChange={(employeeId) => {
            setHasSelectedEmployee(Boolean(employeeId));
            setSelectedEmployeeId(employeeId);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
