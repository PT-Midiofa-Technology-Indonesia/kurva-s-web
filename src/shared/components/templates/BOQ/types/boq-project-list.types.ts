export type BOQProjectListStage = 'planning' | 'final' | 'execution';

export interface BOQProjectListItem {
  id: string;
  projectName: string;
  projectOwner: string;
  clientName: string;
  estimatedValue: number;
  totalValue: number;
  projectStartDate: string;
  projectEndDate: string;
  description: string;
  statusBoqComplete: boolean;
  settingStatus: 'complete' | 'incomplete';
  /** When true, limit budget is already set for the project */
  isLimitBudgetComplete?: boolean;
  /** When true, the project already has a BOQ plan — action navigates directly to detail */
  statusBoqPlanning: boolean;
  statusBoqFinal: boolean;
  statusBoqExecution: boolean;
  /** When true, the project name renders as an underlined clickable button */
  isClickable?: boolean;
}
