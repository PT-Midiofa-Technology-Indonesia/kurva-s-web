'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AsyncSelect, Button } from '@/components/atoms';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSkillCatalogsInfinite } from '@/domains/skill-master/hooks/use-skill-catalogs-infinite';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { useCreateEmployeeSkill } from '../hooks/use-create-employee-skill';
import { useUpdateEmployeeSkill } from '../hooks/use-update-employee-skill';
import type { EmployeeSkill } from '../types';

const skillFormSchema = z.object({
  skillCatalogId: z.string().min(1, 'Skill harus dipilih'),
  isActive: z.boolean(),
});

type SkillFormInput = z.infer<typeof skillFormSchema>;

interface EmployeeSkillFormDrawerProps {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  companyId?: string;
  onSuccess?: () => void;
  editTarget?: EmployeeSkill | null;
}

const FORM_ID = 'employee-skill-form';

export function EmployeeSkillFormDrawer({
  open,
  onClose,
  employeeId,
  companyId,
  onSuccess,
  editTarget,
}: EmployeeSkillFormDrawerProps) {
  const isEdit = !!editTarget;
  const {
    options: skillCatalogOptions,
    isLoading: catalogsLoading,
    hasMore,
    isFetchingNextPage,
    loadMore,
  } = useSkillCatalogsInfinite({ perPage: 50 });
  const { mutate: createSkill, isPending: isCreating } = useCreateEmployeeSkill(
    employeeId,
    companyId
  );
  const { mutate: updateSkill, isPending: isUpdating } = useUpdateEmployeeSkill(
    employeeId,
    editTarget?.id ?? '',
    companyId
  );

  const isSubmitting = isCreating || isUpdating;
  const isLoading = catalogsLoading;

  const form = useForm<SkillFormInput>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      skillCatalogId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        skillCatalogId: editTarget?.skillCatalogId ?? '',
        isActive: editTarget?.isActive ?? true,
      });
    }
  }, [open, editTarget, form]);

  const handleSubmit = form.handleSubmit((data) => {
    const payload = { skillCatalogId: data.skillCatalogId, isActive: data.isActive };

    if (isEdit && editTarget) {
      updateSkill(payload, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      });
    } else {
      createSkill(payload, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      });
    }
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && handleClose()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">
              {isEdit ? 'Edit Skill' : 'Tambah Skill'}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <FormProvider {...form}>
          <form
            id={FORM_ID}
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="skillCatalogId">Skill Catalog</Label>
              <Controller
                name="skillCatalogId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <AsyncSelect
                      id="skillCatalogId"
                      value={field.value || null}
                      onChange={(v) => field.onChange(v ?? '')}
                      options={skillCatalogOptions}
                      placeholder="Pilih skill catalog"
                      isDisabled={isLoading}
                      isSearchable
                      isLoading={isFetchingNextPage}
                      onScrollToBottom={hasMore ? loadMore : undefined}
                      onSearchChange={() => {}}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="isActive">Status</Label>
              <Controller
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-brand-600"
                    />
                    <span className="text-sm font-medium text-slate-950">
                      {field.value ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                )}
              />
            </div>
          </form>
        </FormProvider>

        <DrawerFooter className="border-t px-4 py-4">
          <Button type="submit" form={FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full"
          >
            Batal
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
