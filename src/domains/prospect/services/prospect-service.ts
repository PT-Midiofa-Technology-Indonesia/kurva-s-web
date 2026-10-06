import type { KanbanColumnConfig } from '@/shared/components/organisms/KanbanBoard';
import { formatDate } from '@/shared/utils/format';
import type { ProspectStage } from '../types';

export function mapProspectsToKanbanColumns(stages: ProspectStage[]): KanbanColumnConfig[] {
  return stages.map((stage) => ({
    id: stage.stage,
    name: stage.stageName,
    items: stage.projects.map((project) => ({
      id: project.id,
      title: project.name,
      description: project.description,
      dateRange: `${formatDate(project.projectStartDate)} - ${formatDate(project.projectEndDate)}`,
      company: project.client.name,
      attachments: {
        count: project.totalUploadedDocuments,
        total: project.totalDocumentRequirements,
      },
    })),
  }));
}
