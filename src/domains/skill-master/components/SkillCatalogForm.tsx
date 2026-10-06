'use client';

import { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { noWhitespace } from '@/shared/utils/masks';
import { SKILL_CATALOG_LABELS, SKILL_CATALOG_PLACEHOLDERS, STATUS_OPTIONS } from '../constants';
import { useSkillCategoriesInfinite } from '../hooks/use-skill-categories-infinite';
import { useSkillLevelsInfinite } from '../hooks/use-skill-levels-infinite';
import {
  createSkillCatalogFormSchema,
  editSkillCatalogFormSchema,
  type SkillCatalogFormData,
} from '../schemas';
import type { SkillCatalog } from '../types';

interface SkillCatalogFormInput {
  code: string;
  name: string;
  skillCategoryId: string;
  skillLevelId: string;
  description?: string;
  isActive: string;
}

type FormMode = 'create' | 'edit';

function FormActions({
  mode,
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<SkillCatalogFormInput>();
  const labels = mode === 'edit' ? SKILL_CATALOG_LABELS.EDIT : SKILL_CATALOG_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="skill-catalog-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface SkillCatalogFormProps {
  mode?: FormMode;
  skillCatalog?: SkillCatalog | null;
  onSubmit?: (payload: SkillCatalogFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function SkillCatalogForm({
  mode = 'create',
  skillCatalog,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: SkillCatalogFormProps) {
  const isEdit = mode === 'edit';

  const [skillCategorySearch, setSkillCategorySearch] = useState('');
  const [skillLevelSearch, setSkillLevelSearch] = useState('');
  const debouncedSkillCategorySearch = useDebounce(skillCategorySearch, 300);
  const debouncedSkillLevelSearch = useDebounce(skillLevelSearch, 300);

  const {
    options: skillCategoryOptions,
    hasMore: hasMoreSkillCategories,
    isFetchingNextPage: isFetchingMoreSkillCategories,
    loadMore: loadMoreSkillCategories,
  } = useSkillCategoriesInfinite({ search: debouncedSkillCategorySearch });

  const {
    options: skillLevelOptions,
    hasMore: hasMoreSkillLevels,
    isFetchingNextPage: isFetchingMoreSkillLevels,
    loadMore: loadMoreSkillLevels,
  } = useSkillLevelsInfinite({ search: debouncedSkillLevelSearch });

  const handleSkillCategorySearchChange = useCallback((v: string) => setSkillCategorySearch(v), []);
  const handleSkillCategoryScrollToBottom = useCallback(() => {
    if (hasMoreSkillCategories && !isFetchingMoreSkillCategories) loadMoreSkillCategories();
  }, [hasMoreSkillCategories, isFetchingMoreSkillCategories, loadMoreSkillCategories]);

  const handleSkillLevelSearchChange = useCallback((v: string) => setSkillLevelSearch(v), []);
  const handleSkillLevelScrollToBottom = useCallback(() => {
    if (hasMoreSkillLevels && !isFetchingMoreSkillLevels) loadMoreSkillLevels();
  }, [hasMoreSkillLevels, isFetchingMoreSkillLevels, loadMoreSkillLevels]);

  const defaultValues = useMemo((): SkillCatalogFormInput => {
    if (!skillCatalog) {
      return {
        code: '',
        name: '',
        skillCategoryId: '',
        skillLevelId: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      code: skillCatalog.code ?? '',
      name: skillCatalog.name ?? '',
      skillCategoryId: skillCatalog.skillCategoryId ?? '',
      skillLevelId: skillCatalog.skillLevelId ?? '',
      description: skillCatalog.description ?? '',
      isActive: skillCatalog.isActive ? 'true' : 'false',
    };
  }, [skillCatalog]);

  const fields = useMemo<FormFieldConfig<SkillCatalogFormInput>[]>(
    () => [
      {
        name: 'skillCategoryId',
        type: 'select',
        label: SKILL_CATALOG_LABELS.CREATE.FIELDS.SKILL_CATEGORY,
        placeholder: SKILL_CATALOG_PLACEHOLDERS.SKILL_CATEGORY,
        required: true,
        options: skillCategoryOptions,
        isSearchable: true,
        colSpan: 4,
        onScrollToBottom: handleSkillCategoryScrollToBottom,
        onSearchChange: handleSkillCategorySearchChange,
      },
      {
        name: 'skillLevelId',
        type: 'select',
        label: SKILL_CATALOG_LABELS.CREATE.FIELDS.SKILL_LEVEL,
        placeholder: SKILL_CATALOG_PLACEHOLDERS.SKILL_LEVEL,
        required: true,
        options: skillLevelOptions,
        isSearchable: true,
        colSpan: 4,
        onScrollToBottom: handleSkillLevelScrollToBottom,
        onSearchChange: handleSkillLevelSearchChange,
      },
      {
        name: 'code',
        type: 'text',
        label: SKILL_CATALOG_LABELS.CREATE.FIELDS.CODE,
        placeholder: SKILL_CATALOG_PLACEHOLDERS.CODE,
        required: true,
        colSpan: 4,
        mask: noWhitespace,
      },
      {
        name: 'name',
        type: 'text',
        label: SKILL_CATALOG_LABELS.CREATE.FIELDS.NAME,
        placeholder: SKILL_CATALOG_PLACEHOLDERS.NAME,
        required: true,
        colSpan: 4,
      },
      {
        name: 'isActive',
        type: 'select',
        label: SKILL_CATALOG_LABELS.CREATE.FIELDS.STATUS,
        required: true,
        options: STATUS_OPTIONS,
        placeholder: SKILL_CATALOG_PLACEHOLDERS.STATUS,
        colSpan: 4,
        isSearchable: false,
        isClearable: false,
      },
      {
        name: 'description',
        type: 'textarea',
        label: SKILL_CATALOG_LABELS.CREATE.FIELDS.DESCRIPTION,
        placeholder: SKILL_CATALOG_PLACEHOLDERS.DESCRIPTION,
        required: false,
        colSpan: 12,
      },
    ],
    [
      skillCategoryOptions,
      skillLevelOptions,
      handleSkillCategoryScrollToBottom,
      handleSkillCategorySearchChange,
      handleSkillLevelScrollToBottom,
      handleSkillLevelSearchChange,
    ]
  );

  const handleFormSubmit = (formData: SkillCatalogFormInput) => {
    if (!onSubmit) return;

    const payload = {
      code: formData.code,
      name: formData.name || '',
      skillCategoryId: formData.skillCategoryId,
      skillLevelId: formData.skillLevelId,
      description: formData.description || '',
      isActive: formData.isActive === 'true',
    };

    onSubmit(payload);
  };

  return (
    <FormCard>
      <FormGenerator<SkillCatalogFormInput>
        id="skill-catalog-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editSkillCatalogFormSchema : createSkillCatalogFormSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <FormActions
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
