'use client';

import { X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/atoms';
import type { FormFieldConfig } from '@/components/organisms/FormGenerator';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { useSkillCatalogsInfinite } from '@/domains/skill-master';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { COMMON_LABELS } from '@/shared/constants';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { vendorCapabilitySchema } from '../schemas';
import type { VendorCapability, VendorCapabilityFormInput } from '../types';

interface VendorCapabilityFormDrawerProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  editItem?: VendorCapability | null;
  detailData?: VendorCapability | null;
  onSave: (payload: { vendorId: string; skillCatalogId: string; isActive: boolean }) => void;
  isSaving?: boolean;
}

export function VendorCapabilityFormDrawer({
  open,
  onClose,
  vendorId,
  vendorName,
  editItem,
  detailData,
  onSave,
  isSaving,
}: VendorCapabilityFormDrawerProps) {
  const isEdit = !!editItem;
  const currentItem = detailData ?? editItem ?? null;

  const [skillSearch, setSkillSearch] = useState('');
  const debouncedSkillSearch = useDebounce(skillSearch, 300);

  const {
    options: skillOptions,
    isLoading: isLoadingSkills,
    hasMore: hasMoreSkills,
    isFetchingNextPage: isFetchingMoreSkills,
    loadMore: loadMoreSkills,
  } = useSkillCatalogsInfinite({ search: debouncedSkillSearch, isActive: true, enabled: open });

  const handleSkillSearchChange = useCallback((v: string) => setSkillSearch(v), []);
  const handleSkillScrollToBottom = useCallback(() => {
    if (hasMoreSkills && !isFetchingMoreSkills) loadMoreSkills();
  }, [hasMoreSkills, isFetchingMoreSkills, loadMoreSkills]);

  const fields: FormFieldConfig<VendorCapabilityFormInput>[] = useMemo(
    () => [
      {
        type: 'custom',
        content: (
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">{vendorName}</p>
          </div>
        ),
        colSpan: 12,
      },
      {
        name: 'skillCatalogId',
        label: VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.FIELDS.SKILL,
        type: 'select',
        isSearchable: true,
        isClearable: true,
        isLoading: isLoadingSkills,
        options: skillOptions,
        placeholder: VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.PLACEHOLDERS.SKILL,
        required: true,
        colSpan: 12,
        onScrollToBottom: handleSkillScrollToBottom,
        onSearchChange: handleSkillSearchChange,
      },
      {
        name: 'isActive',
        label: VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.FIELDS.STATUS,
        type: 'switch',
        stateActiveLabel: COMMON_LABELS.STATUS.ACTIVE,
        stateInactiveLabel: COMMON_LABELS.STATUS.INACTIVE,
        required: true,
        colSpan: 12,
      },
    ],
    [vendorName, skillOptions, isLoadingSkills, handleSkillScrollToBottom, handleSkillSearchChange]
  );

  const handleSubmit = (data: VendorCapabilityFormInput) => {
    onSave({
      vendorId,
      skillCatalogId: data.skillCatalogId,
      isActive: data.isActive,
    });
  };

  const handleCancel = () => {
    onClose();
  };

  const title = isEdit
    ? VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.EDIT_TITLE
    : VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.ADD_TITLE;

  const defaultValues: VendorCapabilityFormInput = useMemo(
    () => ({
      skillCatalogId: currentItem?.skillCatalogId ?? '',
      isActive: currentItem?.isActive ?? true,
    }),
    [currentItem]
  );

  return (
    <Drawer open={open} onOpenChange={(v) => !v && handleCancel()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold text-[#0A0A0A]">{title}</DrawerTitle>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <FormGenerator
            key={open ? (editItem?.id ?? 'new') : 'closed'}
            id="vendor-capability-form"
            schema={vendorCapabilitySchema}
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            className="content-start"
          />
        </div>

        <DrawerFooter className="border-t px-4 py-4">
          <Button type="submit" form="vendor-capability-form" disabled={isSaving}>
            {isSaving
              ? VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.BUTTONS.SAVING
              : VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.BUTTONS.SAVE}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleCancel}
            disabled={isSaving}
          >
            {VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.BUTTONS.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
