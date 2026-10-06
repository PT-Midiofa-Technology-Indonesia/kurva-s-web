'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms';
import { useDebounce } from '@/hooks/use-debounce';
import { AsyncSelect, type SelectValue } from '@/shared/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { BOQ_TEMPLATE_SELECT_LABELS } from '../constants';
import { useBOQTemplates } from '../hooks';
import { useCreateBOQ } from '../hooks/use-create-boq';
import { useGenerateBOQ } from '../hooks/use-generate-boq';

interface BOQTemplateSelectModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

export function BOQTemplateSelectModal({
  open,
  onClose,
  projectId,
  onSuccess,
}: BOQTemplateSelectModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: templatesData, isLoading: templatesLoading } = useBOQTemplates({
    isActive: true,
    perPage: 100,
    search: debouncedSearch || undefined,
  });

  const { mutateAsync: generateBOQ, isPending: isGenerating } = useGenerateBOQ();
  const { mutateAsync: createBOQ, isPending: isCreating } = useCreateBOQ();

  const isPending = isGenerating || isCreating;

  const templateOptions = (templatesData?.data ?? []).map((template) => ({
    value: template.id,
    label: template.name,
  }));

  const handleTemplateChange = (value: SelectValue) => {
    const id = Array.isArray(value) ? value[0] : value;
    setSelectedTemplateId(id as string | null);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleLanjutkan = async () => {
    if (!selectedTemplateId) return;
    await generateBOQ({
      projectId,
      payload: { boqTemplateId: selectedTemplateId },
    });
    onSuccess();
  };

  const handleSetManual = async () => {
    await createBOQ(projectId);
    onSuccess();
  };

  const handleClose = () => {
    setSelectedTemplateId(null);
    setSearch('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="w-[430px] max-w-[430px] p-6 gap-4">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-lg font-semibold text-slate-950">
            {BOQ_TEMPLATE_SELECT_LABELS.title}
          </DialogTitle>
          <DialogDescription className="text-sm font-normal text-slate-500">
            {BOQ_TEMPLATE_SELECT_LABELS.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-0">
          <div className="flex items-center px-1 py-0.5 h-7">
            <label className="text-sm font-medium text-slate-950">
              {BOQ_TEMPLATE_SELECT_LABELS.templateLabel}
            </label>
          </div>
          <AsyncSelect
            options={templateOptions}
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            placeholder={BOQ_TEMPLATE_SELECT_LABELS.templatePlaceholder}
            isLoading={templatesLoading}
            onSearchChange={handleSearchChange}
            isClearable
          />
        </div>

        <DialogFooter className="gap-2 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={handleSetManual}
            disabled={isPending}
            className="flex-1"
          >
            {BOQ_TEMPLATE_SELECT_LABELS.setManual}
          </Button>
          <Button
            type="button"
            onClick={handleLanjutkan}
            disabled={!selectedTemplateId || isPending}
            className="flex-1"
          >
            {BOQ_TEMPLATE_SELECT_LABELS.lanjutkan}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
