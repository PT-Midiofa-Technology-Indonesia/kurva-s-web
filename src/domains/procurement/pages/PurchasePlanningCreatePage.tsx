'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { PageHeader } from '@/shared/components/molecules';
import { Stepper } from '@/shared/components/molecules/Stepper';
import type { StepItem } from '@/shared/components/molecules/Stepper/types';
import type {
  BoQRow,
  VendorColumnDef,
} from '@/shared/components/templates/Procurement/ComparisonPanel';
import type { PriceCell } from '@/shared/components/templates/Procurement/ComparisonPanel/ComparisonPanel';
import { type PickWinnerRow } from '../components/PickWinnerPanel';
import { StepComparisonSection } from '../components/StepComparisonSection';
import { StepFinalizeSection } from '../components/StepFinalizeSection';
import { StepPickWinnerSection } from '../components/StepPickWinnerSection';
import { StepPilihItemsSection } from '../components/StepPilihItemsSection';
import { StepPilihPrSection } from '../components/StepPilihPrSection';
import { useApprovedPrItems } from '../hooks/use-approved-pr-items';
import { useCompanyId } from '../hooks/use-company-id';
import { useFinalizePoDraft } from '../hooks/use-finalize-po-draft';
import { usePoDraftDetail } from '../hooks/use-po-draft-detail-api';
import { usePoDraftProjects } from '../hooks/use-po-draft-projects';
import { usePoDraftWizard } from '../hooks/use-po-draft-wizard';
import {
  useSetPoDraftItemWinners,
  type WinnerSelection,
} from '../hooks/use-set-po-draft-item-winners';
import { useWizardPurchaseRequests } from '../hooks/use-wizard-purchase-requests';
import { buildFinalizePayload } from '../services/build-finalize-payload';
import type { PoPreview } from '../types/po-finalize';

interface PurchasePlanningCreatePageProps {
  /** When editing an existing draft — pre-set draftId and start at startStep */
  draftId?: string;
  /** Step index to start from (default 0). Typically 2 (comparison) when editing */
  startStep?: number;
}

export function PurchasePlanningCreatePage({
  draftId: initialDraftId,
  startStep,
}: PurchasePlanningCreatePageProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = useCompanyId();
  const rawType = searchParams.get('type');
  const typeParam = rawType === 'materialTool' || rawType === 'serviceRental' ? rawType : undefined;

  // Guard: redirect to list if companyId or typeParam is missing
  useEffect(() => {
    if (!companyId || !typeParam) {
      router.replace('/procurement/purchase-planning');
    }
  }, [companyId, typeParam, router]);

  const {
    currentStep,
    setCurrentStep,
    steps,
    projectId,
    setProjectId,
    selectedPrIds,
    togglePr,
    commonType,
    setCommonType,
    selectedItemIds,
    toggleItem,
    itemQtyMap,
    invalidQtyItemIds,
    setItemQty,
    search,
    setSearch,
    draftId,
    createDraftMut,
    canGoNext,
    nextStep,
    prevStep,
  } = usePoDraftWizard(
    initialDraftId ? { initialDraftId, initialStep: startStep ?? 2 } : undefined
  );

  const isEdit = !!initialDraftId;

  // Fetch draft detail to check isVendorSelected or finalized status
  const { data: draftDetail, isLoading: draftDetailLoading } = usePoDraftDetail(draftId);

  // If vendor is already selected, jump to step 4 (Finalize)
  // If finalized, jump directly to step 4 (Finalize) — the last step
  useEffect(() => {
    if (draftDetailLoading) return;
    const targetStep =
      draftDetail?.status === 'finalized' || draftDetail?.isVendorSelected ? 4 : -1;
    if (targetStep >= 0 && currentStep < targetStep) {
      setCurrentStep(targetStep);
    }
  }, [draftDetail, draftDetailLoading, currentStep, setCurrentStep]);

  // ── API hooks ──
  const { data: projects, isLoading: projectsLoading } = usePoDraftProjects(typeParam);
  const { data: prs, isLoading: prsLoading } = useWizardPurchaseRequests(projectId);
  const { data: allApprovedItems, isLoading: itemsLoading } = useApprovedPrItems({
    projectId,
    type: commonType ?? 'materialTool',
  });

  // ── Lifted: Comparison → PickWinner → Finalize ──
  const [compRows, setCompRows] = useState<BoQRow[]>([]);
  const [vendorCols, setVendorCols] = useState<VendorColumnDef[]>([]);
  const [vendorData, setVendorData] = useState<Record<string, PriceCell[]>>({});
  const [pickWinnerRows, setPickWinnerRows] = useState<PickWinnerRow[]>([]);
  const [canFinalize, setCanFinalize] = useState(false);
  const [poList, setPoList] = useState<PoPreview[]>([]);

  const { mutate: finalizeDraft, isPending: isFinalizing } = useFinalizePoDraft({
    companyId: companyId ?? '',
  });
  const { mutate: setItemWinners, isPending: isSavingWinners } = useSetPoDraftItemWinners({
    companyId,
  });

  const handleFinalize = useCallback(() => {
    if (!draftId) return;
    finalizeDraft(
      { draftId, payload: buildFinalizePayload(poList) },
      {
        onSuccess: () => {
          router.push(`/procurement/purchase-planning?companyId=${companyId}`);
        },
      }
    );
  }, [draftId, poList, finalizeDraft, router, companyId]);

  // ── Step 4 (Pick Winner) → Step 5 (Finalize): persist winner selections first ──
  const handleNext = useCallback(() => {
    const isPickWinnerStep = steps[currentStep]?.key === 'pick-winner';
    if (!isPickWinnerStep || !draftId) {
      nextStep();
      return;
    }

    const selections: WinnerSelection[] = pickWinnerRows.reduce<WinnerSelection[]>((acc, row) => {
      const vendorId = Object.entries(row.selections).find(([, selected]) => selected)?.[0];
      if (vendorId) acc.push({ itemId: row.id, vendorId });
      return acc;
    }, []);

    if (selections.length === 0) {
      nextStep();
      return;
    }

    setItemWinners({ draftId, selections }, { onSuccess: () => nextStep() });
  }, [steps, currentStep, draftId, pickWinnerRows, setItemWinners, nextStep]);

  // ── Filtered items for step 2 ──
  const itemsForStep2 = useMemo(() => {
    if (!allApprovedItems) return [];
    const filtered = allApprovedItems.filter((item) =>
      selectedPrIds.includes(item.purchaseRequestId)
    );
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (item) =>
        (item.code ?? '').toLowerCase().includes(q) ||
        (item.catalogName ?? '').toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q)
    );
  }, [allApprovedItems, selectedPrIds, search]);

  const handleBack = useCallback(() => router.back(), [router]);

  const handleSelectProject = useCallback(
    (id: string, _name: string) => {
      setProjectId(id);
    },
    [setProjectId]
  );

  const stepperItems: StepItem[] = steps.map((step, idx) => ({
    key: step.key,
    label: step.label,
    content: (
      <>
        {idx === 0 && (
          <StepPilihPrSection
            projects={projects ?? []}
            projectsLoading={projectsLoading}
            selectedProjectId={projectId}
            onSelectProject={handleSelectProject}
            prs={prs ?? []}
            prsLoading={prsLoading}
            selectedPrIds={selectedPrIds}
            onTogglePr={togglePr}
            commonType={commonType}
            onSetCommonType={setCommonType}
          />
        )}
        {idx === 1 && (
          <StepPilihItemsSection
            items={itemsForStep2}
            itemsLoading={itemsLoading}
            selectedItemIds={selectedItemIds}
            invalidQtyItemIds={invalidQtyItemIds}
            onToggleItem={toggleItem}
            itemQtyMap={itemQtyMap}
            onSetItemQty={setItemQty}
            search={search}
            onSearchChange={setSearch}
          />
        )}
        {idx === 2 && (
          <StepComparisonSection
            draftId={draftId}
            onStateChange={(rows, cols, data) => {
              setCompRows(rows);
              setVendorCols(cols);
              setVendorData(data);
            }}
          />
        )}
        {idx === 3 && (
          <StepPickWinnerSection
            rows={compRows}
            vendorColumns={vendorCols}
            vendorData={vendorData}
            onSelectionsChange={setPickWinnerRows}
          />
        )}
        {idx === 4 && (
          <StepFinalizeSection
            pickWinnerRows={pickWinnerRows}
            vendorColumns={vendorCols}
            vendorData={vendorData}
            compRows={compRows}
            onValidChange={setCanFinalize}
            onPoListChange={setPoList}
            isReadOnly={draftDetail?.status === 'finalized'}
            finalizedPos={draftDetail?.pos}
          />
        )}
      </>
    ),
  }));

  if (!companyId) return null;

  const isFinalized = draftDetail?.status === 'finalized';
  const currentStepKey = steps[currentStep]?.key;
  const hidePrevious =
    currentStepKey === 'comparison' || currentStepKey === 'finalize' || isFinalized;
  const prevDisabled =
    currentStep === 0 ||
    (isEdit && currentStep <= startStep!) ||
    createDraftMut.isPending ||
    !!draftDetail?.isVendorSelected;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={isEdit ? `Edit Draft` : 'Create Draft'} onBack={handleBack} />

      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5">
          <Stepper items={stepperItems} activeKey={steps[currentStep]?.key} stepClickable />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {!hidePrevious && (
          <Button variant="outline" onClick={prevStep} disabled={prevDisabled}>
            Previous
          </Button>
        )}
        {!isFinalized && (
          <Button
            variant="default"
            onClick={currentStep === steps.length - 1 ? handleFinalize : handleNext}
            disabled={
              !canGoNext ||
              createDraftMut.isPending ||
              isSavingWinners ||
              (currentStep === steps.length - 1 && (!canFinalize || isFinalizing))
            }
          >
            {currentStep === steps.length - 1 ? 'Finalize Draft' : 'Next'}
          </Button>
        )}
      </div>
    </div>
  );
}
