import type { BOQProjectListItem } from '@/shared/components/templates/BOQ/types/boq-project-list.types';
import type { BOQProject, BOQStage } from '../api/get-boq-projects';

const STAGE_STATUS_FIELD: Record<
  BOQStage,
  keyof Pick<BOQProject, 'statusBoqPlanning' | 'statusBoqFinal' | 'statusBoqExecution'>
> = {
  planning: 'statusBoqPlanning',
  final: 'statusBoqFinal',
  execution: 'statusBoqExecution',
};

export function mapBOQProjectToListItem(project: BOQProject, stage: BOQStage): BOQProjectListItem {
  const field = STAGE_STATUS_FIELD[stage];
  return {
    id: project.id,
    projectName: project.name,
    projectOwner: project.company.name,
    clientName: project.client.name,
    estimatedValue: project.estimatedValue,
    totalValue: project.totalValue,
    projectStartDate: project.projectStartDate,
    projectEndDate: project.projectEndDate,
    description: project.description,
    statusBoqComplete: project.isRabComplete,
    settingStatus: project[field] ? 'complete' : 'incomplete',
    isLimitBudgetComplete: project.isLimitBudgetComplete,
    statusBoqPlanning: project.statusBoqPlanning,
    statusBoqFinal: project.statusBoqFinal,
    statusBoqExecution: project.statusBoqExecution,
  };
}
