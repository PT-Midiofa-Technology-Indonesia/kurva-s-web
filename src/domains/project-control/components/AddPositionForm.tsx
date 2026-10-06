'use client';

import { useCallback, useState } from 'react';
import { usePositionsInfinite } from '@/domains/position/hooks/use-positions-infinite';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useCreateProjectHierarchyTemplateNode } from '../hooks/use-project-hierarchy-template-nodes';

interface AddPositionFormProps {
  templateId: string;
  parentId: string | null;
  parentPositionName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddPositionForm({
  templateId,
  parentId,
  parentPositionName,
  onClose,
  onSuccess,
}: AddPositionFormProps) {
  const [positionId, setPositionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [parentPositionId, setParentPositionId] = useState<string | null>(null);
  const [positionSearch, setPositionSearch] = useState('');
  const debouncedPositionSearch = useDebounce(positionSearch, 300);

  const {
    options: positionOptions,
    isLoading: isPositionsLoading,
    hasMore: hasMorePositions,
    isFetchingNextPage: isFetchingMorePositions,
    loadMore: loadMorePositions,
  } = usePositionsInfinite({ search: debouncedPositionSearch, isActive: true });

  const { mutateAsync: createNode, isPending } = useCreateProjectHierarchyTemplateNode();

  const handlePositionSearchChange = useCallback((value: string) => setPositionSearch(value), []);

  const handlePositionScrollToBottom = useCallback(() => {
    if (hasMorePositions && !isFetchingMorePositions) {
      loadMorePositions();
    }
  }, [hasMorePositions, isFetchingMorePositions, loadMorePositions]);

  const handleSubmit = async () => {
    if (!positionId) return;

    await createNode(
      {
        projectHierarchyTemplateId: templateId,
        parentId: parentId ?? parentPositionId ?? null,
        positionId,
        isActive,
        permissionIds: [],
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setPositionId(null);
    setIsActive(true);
    setParentPositionId(null);
    setPositionSearch('');
    onClose();
  };

  const showParentSelect = parentId === null;

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="w-[480px] max-w-[480px] p-6 gap-4">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-lg font-semibold text-slate-950">Add Position</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {parentId && parentPositionName ? (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Parent Position</Label>
              <Input
                value={parentPositionName}
                disabled
                readOnly
                className="bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          ) : showParentSelect ? (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Parent Position <span className="text-xs text-slate-400">(optional)</span>
              </Label>
              <AsyncSelect
                options={positionOptions}
                value={parentPositionId}
                onChange={(value) => setParentPositionId(value as string | null)}
                isSearchable
                isClearable
                isLoading={isPositionsLoading}
                onSearchChange={handlePositionSearchChange}
                onScrollToBottom={handlePositionScrollToBottom}
                placeholder="Select parent position..."
                noOptionsMessage="No positions found"
                loadingMessage="Loading positions..."
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Position <span className="text-red-500">*</span>
            </Label>
            <AsyncSelect
              options={positionOptions}
              value={positionId}
              onChange={(value) => setPositionId(value as string | null)}
              isSearchable
              isClearable
              isLoading={isPositionsLoading}
              onSearchChange={handlePositionSearchChange}
              onScrollToBottom={handlePositionScrollToBottom}
              placeholder="Select position..."
              noOptionsMessage="No positions found"
              loadingMessage="Loading positions..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked)}
            />
            <Label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Active
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !positionId}
            className="flex-1"
          >
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
