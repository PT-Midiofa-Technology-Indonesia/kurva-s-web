'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { useUomsInfinite } from '@/domains/uom/hooks/use-uoms-infinite';
import type { SelectOption } from '@/shared/components/atoms';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreateItemCatalogPayload } from '../api/create-item-catalog';
import type { UpdateItemCatalogPayload } from '../api/update-item-catalog';
import { ITEM_CATALOG_LABELS, STATUS_OPTIONS, YES_NO_OPTIONS } from '../constants';
import { useItemCategoriesInfinite } from '../hooks/use-item-categories-infinite';
import { useItemTypesInfinite } from '../hooks/use-item-types-infinite';
import { createItemCatalogSchema, editItemCatalogSchema } from '../schemas';
import type { ItemCatalogListItem } from '../types';

interface ItemCatalogFormInput {
  itemTypeId: string;
  itemCategoryId: string;
  uomId: string;
  code: string;
  name: string;
  description: string;
  isAllocatable: string;
  isAsset: string;
  isStock: string;
  isSensitive: string;
  isActive: string;
}

type FormMode = 'create' | 'edit';

/**
 * AsyncSelect can only display values whose option is present in its loaded
 * list, so an edit form whose current record is outside the first loaded page
 * would show an empty select. Prepend the current option (from the detail
 * response's nested object) when it is missing from the loaded options.
 */
function withCurrentOption(
  options: SelectOption[],
  current: { id: string; name: string } | null | undefined
): SelectOption[] {
  if (!current || options.some((opt) => opt.value === current.id)) return options;
  return [{ value: current.id, label: current.name }, ...options];
}

function FormActions({
  mode,
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<ItemCatalogFormInput>();
  const labels = ITEM_CATALOG_LABELS.FORM;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.BACK}
      </Button>
      <Button type="submit" form="item-catalog-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting
          ? labels.BUTTONS.SAVING
          : mode === 'edit'
            ? labels.BUTTONS.SAVE_CHANGE
            : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface ItemCatalogFormProps {
  mode?: FormMode;
  itemCatalog?: ItemCatalogListItem | null;
  onSubmit?: (payload: CreateItemCatalogPayload | UpdateItemCatalogPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

/**
 * Watches the `itemTypeId` field and resets `itemCategoryId` when it changes,
 * then notifies the parent so the categories list can be refetched with the
 * new `itemTypeId` filter.
 */
function ItemTypeObserver({ onItemTypeChange }: { onItemTypeChange: (id: string) => void }) {
  const { control, setValue } = useFormContext<ItemCatalogFormInput>();
  const itemTypeId = useWatch({ control, name: 'itemTypeId' });
  const prevRef = useRef(itemTypeId);

  useEffect(() => {
    if (prevRef.current === itemTypeId) return;
    prevRef.current = itemTypeId;
    setValue('itemCategoryId', '', { shouldValidate: false });
    onItemTypeChange(itemTypeId ?? '');
  }, [itemTypeId, setValue, onItemTypeChange]);

  return null;
}

export function ItemCatalogForm({
  mode = 'create',
  itemCatalog,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: ItemCatalogFormProps) {
  const [selectedItemTypeId, setSelectedItemTypeId] = useState<string>(
    itemCatalog?.itemTypeId ?? ''
  );

  const [itemTypeSearch, setItemTypeSearch] = useState('');
  const [itemCategorySearch, setItemCategorySearch] = useState('');
  const [uomSearch, setUomSearch] = useState('');
  const debouncedItemTypeSearch = useDebounce(itemTypeSearch, 300);
  const debouncedItemCategorySearch = useDebounce(itemCategorySearch, 300);
  const debouncedUomSearch = useDebounce(uomSearch, 300);

  const {
    options: itemTypeOptions,
    hasMore: hasMoreItemTypes,
    isFetchingNextPage: isFetchingMoreItemTypes,
    loadMore: loadMoreItemTypes,
  } = useItemTypesInfinite({ search: debouncedItemTypeSearch });

  const {
    options: itemCategoryOptions,
    isLoading: isItemCategoriesLoading,
    hasMore: hasMoreItemCategories,
    isFetchingNextPage: isFetchingMoreItemCategories,
    loadMore: loadMoreItemCategories,
  } = useItemCategoriesInfinite({
    search: debouncedItemCategorySearch,
    itemTypeId: selectedItemTypeId || undefined,
    enabled: !!selectedItemTypeId,
  });

  const {
    options: uomOptions,
    hasMore: hasMoreUoms,
    isFetchingNextPage: isFetchingMoreUoms,
    loadMore: loadMoreUoms,
  } = useUomsInfinite({ search: debouncedUomSearch });

  const displayItemTypeOptions = useMemo(
    () => withCurrentOption(itemTypeOptions, itemCatalog?.itemType),
    [itemTypeOptions, itemCatalog?.itemType]
  );
  const displayItemCategoryOptions = useMemo(
    () => withCurrentOption(itemCategoryOptions, itemCatalog?.itemCategory),
    [itemCategoryOptions, itemCatalog?.itemCategory]
  );
  const displayUomOptions = useMemo(
    () => withCurrentOption(uomOptions, itemCatalog?.uom),
    [uomOptions, itemCatalog?.uom]
  );

  const handleItemTypeSearchChange = useCallback((v: string) => setItemTypeSearch(v), []);
  const handleItemTypeScrollToBottom = useCallback(() => {
    if (hasMoreItemTypes && !isFetchingMoreItemTypes) loadMoreItemTypes();
  }, [hasMoreItemTypes, isFetchingMoreItemTypes, loadMoreItemTypes]);

  const handleItemCategorySearchChange = useCallback((v: string) => setItemCategorySearch(v), []);
  const handleItemCategoryScrollToBottom = useCallback(() => {
    if (hasMoreItemCategories && !isFetchingMoreItemCategories) loadMoreItemCategories();
  }, [hasMoreItemCategories, isFetchingMoreItemCategories, loadMoreItemCategories]);

  const handleUomSearchChange = useCallback((v: string) => setUomSearch(v), []);
  const handleUomScrollToBottom = useCallback(() => {
    if (hasMoreUoms && !isFetchingMoreUoms) loadMoreUoms();
  }, [hasMoreUoms, isFetchingMoreUoms, loadMoreUoms]);

  const defaultValues = useMemo((): ItemCatalogFormInput => {
    if (!itemCatalog) {
      return {
        itemTypeId: '',
        itemCategoryId: '',
        uomId: '',
        code: '',
        name: '',
        description: '',
        isAllocatable: 'false',
        isAsset: 'false',
        isStock: 'false',
        isSensitive: 'false',
        isActive: 'true',
      };
    }
    return {
      itemTypeId: itemCatalog.itemTypeId ?? '',
      itemCategoryId: itemCatalog.itemCategoryId ?? '',
      uomId: itemCatalog.uomId ?? '',
      code: itemCatalog.code ?? '',
      name: itemCatalog.name ?? '',
      description: itemCatalog.description ?? '',
      isAllocatable: itemCatalog.isAllocatable ? 'true' : 'false',
      isAsset: itemCatalog.isAsset ? 'true' : 'false',
      isStock: itemCatalog.isStock ? 'true' : 'false',
      isSensitive: itemCatalog.isSensitive ? 'true' : 'false',
      isActive: itemCatalog.isActive ? 'true' : 'false',
    };
  }, [itemCatalog]);

  const fields = useMemo<FormFieldConfig<ItemCatalogFormInput>[]>(
    () => [
      {
        name: 'itemTypeId',
        type: 'select',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.ITEM_TYPE,
        placeholder: ITEM_CATALOG_LABELS.FORM.PLACEHOLDERS.ITEM_TYPE,
        required: true,
        options: displayItemTypeOptions,
        isSearchable: true,
        colSpan: 4,
        onScrollToBottom: handleItemTypeScrollToBottom,
        onSearchChange: handleItemTypeSearchChange,
      },
      {
        name: 'itemCategoryId',
        type: 'select',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.ITEM_CATEGORY,
        placeholder: ITEM_CATALOG_LABELS.FORM.PLACEHOLDERS.ITEM_CATEGORY,
        required: true,
        options: displayItemCategoryOptions,
        isSearchable: true,
        isLoading: isItemCategoriesLoading,
        enableRules: [{ conditions: [{ field: 'itemTypeId', evaluator: (val) => !!val }] }],
        colSpan: 4,
        onScrollToBottom: handleItemCategoryScrollToBottom,
        onSearchChange: handleItemCategorySearchChange,
      },
      {
        name: 'uomId',
        type: 'select',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.UOM,
        placeholder: ITEM_CATALOG_LABELS.FORM.PLACEHOLDERS.UOM,
        required: true,
        options: displayUomOptions,
        isSearchable: true,
        colSpan: 4,
        onScrollToBottom: handleUomScrollToBottom,
        onSearchChange: handleUomSearchChange,
      },
      {
        name: 'code',
        type: 'text',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.CODE,
        placeholder: ITEM_CATALOG_LABELS.FORM.PLACEHOLDERS.CODE,
        required: true,
        colSpan: 4,
        mask: noWhitespace,
      },
      {
        name: 'name',
        type: 'text',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.NAME,
        placeholder: ITEM_CATALOG_LABELS.FORM.PLACEHOLDERS.NAME,
        required: true,
        colSpan: 4,
      },
      {
        name: 'isAllocatable',
        type: 'select',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.IS_ALLOCATABLE,
        required: false,
        options: YES_NO_OPTIONS,
        isSearchable: false,
        colSpan: 4,
      },
      {
        name: 'isAsset',
        type: 'select',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.IS_ASSET,
        required: false,
        options: YES_NO_OPTIONS,
        isSearchable: false,
        colSpan: 4,
      },
      {
        name: 'isStock',
        type: 'select',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.IS_STOCK,
        required: false,
        options: YES_NO_OPTIONS,
        isSearchable: false,
        colSpan: 4,
      },
      {
        name: 'isSensitive',
        type: 'select',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.IS_SENSITIVE,
        required: false,
        options: YES_NO_OPTIONS,
        isSearchable: false,
        colSpan: 4,
      },
      {
        name: 'isActive',
        type: 'select',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.STATUS,
        required: true,
        options: STATUS_OPTIONS,
        placeholder: ITEM_CATALOG_LABELS.FORM.PLACEHOLDERS.STATUS,
        isSearchable: false,
        isClearable: false,
        colSpan: 4,
      },
      {
        name: 'description',
        type: 'textarea',
        label: ITEM_CATALOG_LABELS.FORM.FIELDS.DESCRIPTION,
        placeholder: ITEM_CATALOG_LABELS.FORM.PLACEHOLDERS.DESCRIPTION,
        required: false,
        colSpan: 12,
      },
      {
        type: 'custom',
        content: <ItemTypeObserver onItemTypeChange={setSelectedItemTypeId} />,
        colSpan: 12,
        className: 'hidden',
      },
    ],
    [
      displayItemTypeOptions,
      displayItemCategoryOptions,
      displayUomOptions,
      isItemCategoriesLoading,
      handleItemTypeScrollToBottom,
      handleItemTypeSearchChange,
      handleItemCategoryScrollToBottom,
      handleItemCategorySearchChange,
      handleUomScrollToBottom,
      handleUomSearchChange,
    ]
  );

  const handleFormSubmit = (formData: ItemCatalogFormInput) => {
    if (!onSubmit) return;

    const basePayload = {
      itemTypeId: formData.itemTypeId,
      itemCategoryId: formData.itemCategoryId,
      uomId: formData.uomId,
      code: formData.code,
      name: formData.name,
      description: formData.description || undefined,
      isAllocatable: formData.isAllocatable === 'true',
      isAsset: formData.isAsset === 'true',
      isStock: formData.isStock === 'true',
      isSensitive: formData.isSensitive === 'true',
      isActive: formData.isActive === 'true',
    };

    onSubmit(basePayload);
  };

  return (
    <FormCard>
      <FormGenerator<ItemCatalogFormInput>
        id="item-catalog-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={(mode === 'edit' ? editItemCatalogSchema : createItemCatalogSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={<FormActions mode={mode} isSubmitting={isSubmitting} onCancel={onCancel} />}
      />
    </FormCard>
  );
}
