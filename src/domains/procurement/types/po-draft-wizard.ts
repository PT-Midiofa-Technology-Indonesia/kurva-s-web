// ── Wizard steps ──
export type WizardStep = 'pilih-pr' | 'pilih-items' | 'comparison' | 'pick-winner' | 'finalize';

// ── PR available to select ──
export interface PrOption {
  id: string;
  code: string;
  projectName: string;
  source: string;
  sourceLabel: string;
}

// ── Item inside a PR ──
export interface PrItem {
  id: string;
  prId: string;
  prCode: string;
  code: string;
  materialName: string;
  volPr: number;
  volPo: number;
  uom: string;
  remarks: string;
}

// ── Full draft data ──
export interface PoDraftWizardData {
  projectId: string;
  projectName: string;
  companyId: string;
  selectedPrs: PrOption[];
  selectedItems: PrItem[];
}
