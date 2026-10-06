'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { createPoDraft } from '../api/create-po-draft';
import { validateSelectedPoDraftItems } from '../services/validate-selected-po-draft-items';
import type { CreatePoDraftPayload } from '../types/api';
import { useCompanyId } from './use-company-id';
import { PO_DRAFT_QUERY_KEYS } from './use-po-draft-projects';

/** Step labels */
const STEPS = [
  { key: 'pilih-pr', label: 'Pilih PR' },
  { key: 'pilih-items', label: 'Pilih Items' },
  { key: 'comparison', label: 'Comparison' },
  { key: 'pick-winner', label: 'Pick Winner' },
  { key: 'finalize', label: 'Finalize' },
];

interface UsePoDraftWizardOptions {
  /** When editing an existing draft — pre-sets the draftId and skips steps before comparison */
  initialDraftId?: string;
  /** Step index to start from (default 0). Typically 2 (comparison) when editing */
  initialStep?: number;
}

export function usePoDraftWizard(options?: UsePoDraftWizardOptions) {
  const companyId = useCompanyId();
  const startStep = options?.initialStep ?? 0;
  const isEdit = !!options?.initialDraftId;

  const [currentStep, setCurrentStep] = useState(startStep);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedPrIds, setSelectedPrIds] = useState<string[]>([]);
  const [commonType, setCommonType] = useState<'materialTool' | 'serviceRental' | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemQtyMap, setItemQtyMap] = useState<Record<string, number>>({});
  const [invalidQtyItemIds, setInvalidQtyItemIds] = useState<string[]>([]);
  const [isStep2Submitted, setIsStep2Submitted] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(options?.initialDraftId ?? null);
  const [search, setSearch] = useState('');

  const queryClient = useQueryClient();

  // ── create-draft mutation (fires when moving step 2 → 3) ──
  const createDraftMut = useMutation({
    mutationFn: (payload: CreatePoDraftPayload) => createPoDraft(payload, companyId),
    onSuccess: (data) => {
      setDraftId(data.id);
      setCurrentStep(2); // move to comparison
      queryClient.invalidateQueries({
        queryKey: PO_DRAFT_QUERY_KEYS.detail(data.id),
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      const fieldErrors = getFieldErrors(error);
      const description = fieldErrors ? Object.values(fieldErrors).flat().join('\n') : undefined;
      toast.error({ title: message, description });
    },
  });

  // ── Toggle PR selection with validation ──
  const togglePr = useCallback((id: string) => {
    setSelectedPrIds((prev) => {
      const isSelected = prev.includes(id);
      if (isSelected) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setInvalidQtyItemIds((prev) => prev.filter((itemId) => itemId !== id));
  }, []);

  const setItemQty = useCallback((itemId: string, qty: number) => {
    setItemQtyMap((prev) => ({ ...prev, [itemId]: qty }));
    if (qty > 0) {
      setInvalidQtyItemIds((prev) => prev.filter((id) => id !== itemId));
    }
  }, []);

  const totalSteps = STEPS.length;

  const canGoNext = useMemo(() => {
    // In edit mode, steps before startStep are pre-filled — always allow
    if (isEdit && currentStep < startStep) return true;
    if (currentStep === 0) return selectedPrIds.length > 0 && !!commonType;
    if (currentStep === 1) return selectedItemIds.length > 0;
    return true;
  }, [currentStep, startStep, isEdit, selectedPrIds, commonType, selectedItemIds]);

  const nextStep = useCallback(() => {
    if (!canGoNext) return;
    if (currentStep === 1) {
      setIsStep2Submitted(true);
      const invalidIds = validateSelectedPoDraftItems(selectedItemIds, itemQtyMap);
      setInvalidQtyItemIds(invalidIds);
      if (invalidIds.length > 0) return;
    }

    // Going from step 2 (items) → step 3 (comparison) — need to create draft first
    if (currentStep === 1 && !draftId && projectId && commonType) {
      const items = selectedItemIds.map((id) => ({
        purchaseRequestItemId: id,
        quantity: itemQtyMap[id] ?? 0,
      }));
      createDraftMut.mutate({
        projectId,
        type: commonType,
        items,
      });
      return; // mutation triggers setCurrentStep(2) on success
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep((p) => p + 1);
    }
  }, [
    currentStep,
    canGoNext,
    draftId,
    projectId,
    commonType,
    selectedItemIds,
    itemQtyMap,
    createDraftMut,
  ]);

  const prevStep = useCallback(() => {
    if (currentStep > startStep) setCurrentStep((p) => p - 1);
  }, [currentStep, startStep]);

  return {
    // State
    currentStep,
    setCurrentStep,
    steps: STEPS,
    projectId,
    setProjectId,
    selectedPrIds,
    togglePr,
    commonType,
    setCommonType,
    selectedItemIds,
    toggleItem,
    itemQtyMap,
    invalidQtyItemIds: isStep2Submitted ? invalidQtyItemIds : [],
    setItemQty,
    search,
    setSearch,
    draftId,
    createDraftMut,

    // Nav
    canGoNext,
    nextStep,
    prevStep,
    totalSteps,
  };
}
