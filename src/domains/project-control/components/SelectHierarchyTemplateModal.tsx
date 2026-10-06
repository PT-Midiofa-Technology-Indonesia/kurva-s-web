'use client';

import { useState } from 'react';
import { AsyncSelect, Button, type SelectValue } from '@/shared/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { PROJECT_HIERARCHY_TEMPLATE_SELECT_LABELS } from '../constants';
import { useProjectHierarchyTemplatesInfinite } from '../hooks/use-project-hierarchy-templates-infinite';

interface SelectHierarchyTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSelectGenerate: (templateId: string) => void;
  onSetManual: () => void;
  isGenerating?: boolean;
}

export function SelectHierarchyTemplateModal({
  open,
  onOpenChange,
  projectId,
  onSelectGenerate,
  onSetManual,
  isGenerating,
}: SelectHierarchyTemplateModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useProjectHierarchyTemplatesInfinite(search || undefined);

  const handleSelectChange = (value: SelectValue) => {
    const id = Array.isArray(value) ? value[0] : value;
    setSelectedTemplateId(typeof id === 'string' ? id : null);
  };

  const handleLanjutkan = () => {
    if (!selectedTemplateId) return;
    onSelectGenerate(selectedTemplateId);
  };

  return (
    <Dialog key={projectId} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{PROJECT_HIERARCHY_TEMPLATE_SELECT_LABELS.TITLE}</DialogTitle>
          <DialogDescription>
            {PROJECT_HIERARCHY_TEMPLATE_SELECT_LABELS.DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-900">
              {PROJECT_HIERARCHY_TEMPLATE_SELECT_LABELS.TEMPLATE_LABEL}
            </label>
            <AsyncSelect
              options={data?.options ?? []}
              placeholder={PROJECT_HIERARCHY_TEMPLATE_SELECT_LABELS.TEMPLATE_PLACEHOLDER}
              isLoading={isLoading || isFetchingNextPage}
              isSearchable
              isClearable
              onSearchChange={(v: string) => setSearch(v)}
              onChange={handleSelectChange}
              onScrollToBottom={hasNextPage ? () => fetchNextPage() : undefined}
            />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onSetManual();
            }}
            className="flex-1"
          >
            {PROJECT_HIERARCHY_TEMPLATE_SELECT_LABELS.SET_MANUAL}
          </Button>
          <Button
            onClick={handleLanjutkan}
            disabled={!selectedTemplateId || isGenerating}
            className="flex-1"
          >
            {isGenerating ? 'Memproses...' : PROJECT_HIERARCHY_TEMPLATE_SELECT_LABELS.LANJUTKAN}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
