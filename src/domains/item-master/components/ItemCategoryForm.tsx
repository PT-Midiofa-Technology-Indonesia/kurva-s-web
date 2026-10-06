'use client';

import { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreateItemCategoryPayload } from '../api/create-item-category';
import type { UpdateItemCategoryPayload } from '../api/update-item-category';
import { ITEM_CATEGORY_LABELS, STATUS_OPTIONS } from '../constants';
import { useItemTypesInfinite } from '../hooks/use-item-types-infinite';
import { createItemCategorySchema, editItemCategorySchema } from '../schemas';
import type { ItemCategoryListItem } from '../types';

interface ItemCategoryFormInput {
  itemTypeId: string;
  code: string;
  name: string;
  parentId: string;
  description: string;
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
  const { formState } = useFormContext<ItemCategoryFormInput>();
  const labels = ITEM_CATEGORY_LABELS.FORM;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.BACK}
      </Button>
      <Button type="submit" form="item-category-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting
          ? labels.BUTTONS.SAVING
          : mode === 'edit'
            ? labels.BUTTONS.SAVE_CHANGE
            : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface ItemCategoryFormProps {
  mode?: FormMode;
  itemCategory?: ItemCategoryListItem | null;
  onSubmit?: (payload: CreateItemCategoryPayload | UpdateItemCategoryPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function ItemCategoryForm({
  mode = 'create',
  itemCategory,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: ItemCategoryFormProps) {
  const [itemTypeSearch, setItemTypeSearch] = useState('');
  const debouncedItemTypeSearch = useDebounce(itemTypeSearch, 300);

  const {
    options: itemTypeOptions,
    isLoading: isLoadingItemTypes,
    hasMore: hasMoreItemTypes,
    isFetchingNextPage: isFetchingMoreItemTypes,
    loadMore: loadMoreItemTypes,
  } = useItemTypesInfinite({ search: debouncedItemTypeSearch });

  const handleItemTypeSearchChange = useCallback((v: string) => setItemTypeSearch(v), []);
  const handleItemTypeScrollToBottom = useCallback(() => {
    if (hasMoreItemTypes && !isFetchingMoreItemTypes) loadMoreItemTypes();
  }, [hasMoreItemTypes, isFetchingMoreItemTypes, loadMoreItemTypes]);

  const defaultValues = useMemo((): ItemCategoryFormInput => {
    if (!itemCategory) {
      return {
        itemTypeId: '',
        code: '',
        name: '',
        parentId: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      itemTypeId: itemCategory.itemTypeId ?? '',
      code: itemCategory.code ?? '',
      name: itemCategory.name ?? '',
      parentId: itemCategory.parentId ?? '',
      description: itemCategory.description ?? '',
      isActive: itemCategory.isActive ? 'true' : 'false',
    };
  }, [itemCategory]);

  const fields = useMemo<FormFieldConfig<ItemCategoryFormInput>[]>(
    () => [
      {
        name: 'code',
        type: 'text',
        label: ITEM_CATEGORY_LABELS.FORM.FIELDS.CODE,
        placeholder: ITEM_CATEGORY_LABELS.FORM.PLACEHOLDERS.CODE,
        required: true,
        colSpan: 6,
        mask: noWhitespace,
      },
      {
        name: 'itemTypeId',
        type: 'select',
        label: ITEM_CATEGORY_LABELS.FORM.FIELDS.ITEM_TYPE,
        placeholder: ITEM_CATEGORY_LABELS.FORM.PLACEHOLDERS.ITEM_TYPE,
        required: true,
        options: itemTypeOptions,
        isLoading: isLoadingItemTypes,
        isSearchable: true,
        colSpan: 6,
        onScrollToBottom: handleItemTypeScrollToBottom,
        onSearchChange: handleItemTypeSearchChange,
      },
      {
        name: 'name',
        type: 'text',
        label: ITEM_CATEGORY_LABELS.FORM.FIELDS.NAME,
        placeholder: ITEM_CATEGORY_LABELS.FORM.PLACEHOLDERS.NAME,
        required: true,
        colSpan: 6,
      },
      {
        name: 'isActive',
        type: 'select',
        label: ITEM_CATEGORY_LABELS.FORM.FIELDS.STATUS,
        required: true,
        options: STATUS_OPTIONS,
        placeholder: ITEM_CATEGORY_LABELS.FORM.PLACEHOLDERS.STATUS,
        isSearchable: false,
        isClearable: false,
        colSpan: 6,
      },
      {
        name: 'description',
        type: 'textarea',
        label: ITEM_CATEGORY_LABELS.FORM.FIELDS.DESCRIPTION,
        placeholder: ITEM_CATEGORY_LABELS.FORM.PLACEHOLDERS.DESCRIPTION,
        required: false,
        colSpan: 12,
      },
    ],
    [itemTypeOptions, isLoadingItemTypes, handleItemTypeScrollToBottom, handleItemTypeSearchChange]
  );

  const handleFormSubmit = (formData: ItemCategoryFormInput) => {
    if (!onSubmit) return;

    if (mode === 'edit') {
      const payload: UpdateItemCategoryPayload = {
        itemTypeId: formData.itemTypeId,
        code: formData.code,
        name: formData.name,
        parentId: formData.parentId || null,
        description: formData.description || null,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    } else {
      const payload: CreateItemCategoryPayload = {
        itemTypeId: formData.itemTypeId,
        code: formData.code,
        name: formData.name,
        parentId: formData.parentId || null,
        description: formData.description,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    }
  };

  return (
    <FormCard>
      <FormGenerator<ItemCategoryFormInput>
        id="item-category-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={(mode === 'edit' ? editItemCategorySchema : createItemCategorySchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={<FormActions mode={mode} isSubmitting={isSubmitting} onCancel={onCancel} />}
      />
    </FormCard>
  );
}
