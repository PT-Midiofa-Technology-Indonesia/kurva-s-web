'use client';

import { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, type SelectOption } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { useSkillCatalogsInfinite } from '@/domains/skill-master';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useCompanyPositionLevels } from '@/shared/hooks/use-enums';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreatePositionPayload } from '../api/create-position';
import type { UpdatePositionPayload } from '../api/update-position';
import { PLACEHOLDERS, POSITION_LABELS, STATUS_OPTIONS } from '../constants';
import { createPositionSchema, editPositionSchema } from '../schemas';
import type { Position } from '../types';

interface PositionFormInput {
  code: string;
  name: string;
  level: string;
  isActive: string;
  skillCatalogIds: string[];
}

function buildFormFields(
  levelOptions: SelectOption[],
  isLevelsLoading: boolean,
  skillOptions: SelectOption[],
  isLoadingSkills: boolean,
  handleSkillSearchChange: (v: string) => void,
  handleSkillScrollToBottom: () => void
): FormFieldConfig<PositionFormInput>[] {
  return [
    {
      name: 'code',
      type: 'text',
      label: POSITION_LABELS.CREATE.FIELDS.CODE,
      placeholder: PLACEHOLDERS.CODE,
      required: true,
      colSpan: 6,
      mask: noWhitespace,
    },
    {
      name: 'name',
      type: 'text',
      label: POSITION_LABELS.CREATE.FIELDS.NAME,
      placeholder: PLACEHOLDERS.NAME,
      required: true,
      colSpan: 6,
    },
    {
      name: 'level',
      type: 'select',
      label: POSITION_LABELS.CREATE.FIELDS.LEVEL,
      required: true,
      options: levelOptions,
      placeholder: PLACEHOLDERS.LEVEL,
      colSpan: 6,
      isSearchable: false,
      isClearable: false,
      isLoading: isLevelsLoading,
    },
    {
      name: 'isActive',
      type: 'select',
      label: POSITION_LABELS.CREATE.FIELDS.STATUS,
      required: true,
      options: STATUS_OPTIONS,
      placeholder: PLACEHOLDERS.STATUS,
      colSpan: 6,
      isSearchable: false,
      isClearable: false,
    },
    {
      name: 'skillCatalogIds',
      type: 'select',
      label: POSITION_LABELS.CREATE.FIELDS.SKILL_CATALOG,
      required: false,
      isMulti: true,
      isSearchable: true,
      isClearable: true,
      options: skillOptions,
      placeholder: PLACEHOLDERS.SKILL_CATALOG,
      isLoading: isLoadingSkills,
      colSpan: 12,
      onScrollToBottom: handleSkillScrollToBottom,
      onSearchChange: handleSkillSearchChange,
    },
  ];
}

type FormMode = 'create' | 'edit';

function PositionFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<PositionFormInput>();
  const labels = mode === 'edit' ? POSITION_LABELS.EDIT : POSITION_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="position-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface PositionFormProps {
  mode?: FormMode;
  position?: Position | null;
  onSubmit?: (payload: CreatePositionPayload | UpdatePositionPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function PositionForm({
  mode = 'create',
  position,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: PositionFormProps) {
  const isEdit = mode === 'edit';

  const { data: levelOptionsData, isFetching: isLevelsLoading } = useCompanyPositionLevels();
  const levelOptions = useMemo<SelectOption[]>(
    () => (levelOptionsData ?? []).map((o) => ({ ...o, value: String(o.value) })),
    [levelOptionsData]
  );

  const [skillSearch, setSkillSearch] = useState('');
  const debouncedSkillSearch = useDebounce(skillSearch, 300);
  const {
    options: skillOptions,
    isLoading: isLoadingSkills,
    hasMore: hasMoreSkills,
    isFetchingNextPage: isFetchingMoreSkills,
    loadMore: loadMoreSkills,
  } = useSkillCatalogsInfinite({ search: debouncedSkillSearch, isActive: true });
  const handleSkillSearchChange = useCallback((v: string) => setSkillSearch(v), []);
  const handleSkillScrollToBottom = useCallback(() => {
    if (hasMoreSkills && !isFetchingMoreSkills) loadMoreSkills();
  }, [hasMoreSkills, isFetchingMoreSkills, loadMoreSkills]);

  const fields = useMemo(
    () =>
      buildFormFields(
        levelOptions,
        isLevelsLoading,
        skillOptions,
        isLoadingSkills,
        handleSkillSearchChange,
        handleSkillScrollToBottom
      ),
    [
      levelOptions,
      isLevelsLoading,
      skillOptions,
      isLoadingSkills,
      handleSkillSearchChange,
      handleSkillScrollToBottom,
    ]
  );

  const defaultValues = useMemo((): PositionFormInput => {
    if (!position) {
      return {
        code: '',
        name: '',
        level: '',
        isActive: 'true',
        skillCatalogIds: [],
      };
    }
    return {
      code: position.code ?? '',
      name: position.name ?? '',
      level: position.level != null ? String(position.level) : '',
      isActive: position.isActive ? 'true' : 'false',
      skillCatalogIds: position.skillCatalogIds ?? position.skillCatalogs?.map((s) => s.id) ?? [],
    };
  }, [position]);

  const handleFormSubmit = (formData: PositionFormInput) => {
    if (!onSubmit) return;

    const level = parseInt(formData.level, 10);

    if (isEdit) {
      const payload: UpdatePositionPayload = {
        code: formData.code,
        name: formData.name || null,
        level,
        isActive: formData.isActive === 'true',
        skillCatalogIds: formData.skillCatalogIds,
      };
      onSubmit(payload);
    } else {
      const payload: CreatePositionPayload = {
        code: formData.code,
        name: formData.name,
        level,
        isActive: formData.isActive === 'true',
        skillCatalogIds: formData.skillCatalogIds,
      };
      onSubmit(payload);
    }
  };

  return (
    <FormCard>
      <FormGenerator<PositionFormInput>
        id="position-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editPositionSchema : createPositionSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <PositionFormActions
              mode={isEdit ? 'edit' : 'create'}
              isSubmitting={isSubmitting}
              onCancel={onCancel}
            />
          </div>
        }
      />
    </FormCard>
  );
}
