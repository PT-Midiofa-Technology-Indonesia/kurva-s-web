'use client';

import type { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type {
  CostRequestDisplayFile,
  CostRequestDisplayItem,
} from '../components/CostRequestItemAccordionList';
import type { CostRequestItemFormValues, CreateCostRequestFormValues } from '../schemas';
import { computeTotalAmount } from '../services/compute-total-amount';

function toDisplayItem(item: CostRequestItemFormValues, key: string): CostRequestDisplayItem {
  const existingFiles: CostRequestDisplayFile[] = item.existingProofs.map((proof) => ({
    key: `existing-${proof.id}`,
    fileName: proof.fileName,
    fileSize: proof.fileSize,
    url: proof.url,
    previewUrl: proof.url,
  }));
  const newFiles: CostRequestDisplayFile[] = item.proofFiles.map((file, index) => ({
    key: `new-${index}-${file.name}`,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    sourceFile: file,
  }));

  return {
    key,
    description: item.description,
    receiptNumber: item.receiptNumber,
    amount: item.amount,
    files: [...existingFiles, ...newFiles],
  };
}

interface UseCostRequestItemsBuilderParams {
  control: Control<CreateCostRequestFormValues>;
  watch: UseFormWatch<CreateCostRequestFormValues>;
  setValue: UseFormSetValue<CreateCostRequestFormValues>;
}

/**
 * Headless glue for the "staging row -> accordion list" items UX. Takes the
 * host form's control/watch/setValue explicitly (rather than via
 * useFormContext) since the only call site (CostRequestFormModal, shared by
 * create and edit) already holds its own `form` object directly.
 */
export function useCostRequestItemsBuilder({
  control,
  watch,
  setValue,
}: UseCostRequestItemsBuilderParams) {
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items') ?? [];

  const totalAmount = computeTotalAmount(items);

  const displayItems: CostRequestDisplayItem[] = fields.map((field, index) =>
    toDisplayItem(items[index] ?? field, field.id)
  );

  const handleAddItem = (draft: CostRequestItemFormValues) => {
    append(draft);
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const handleRemoveFile = (itemIndex: number, file: CostRequestDisplayFile) => {
    if (file.key.startsWith('existing-')) {
      const proofId = file.key.replace('existing-', '');
      const current = items[itemIndex]?.existingProofs ?? [];
      setValue(
        `items.${itemIndex}.existingProofs`,
        current.filter((proof) => proof.id !== proofId)
      );
      return;
    }

    const current = items[itemIndex]?.proofFiles ?? [];
    const fileIndex = current.findIndex(
      (proofFile, i) => `new-${i}-${proofFile.name}` === file.key
    );
    if (fileIndex >= 0) {
      setValue(
        `items.${itemIndex}.proofFiles`,
        current.filter((_, i) => i !== fileIndex)
      );
    }
  };

  return {
    displayItems,
    totalAmount,
    handleAddItem,
    handleRemoveItem,
    handleRemoveFile,
  };
}
