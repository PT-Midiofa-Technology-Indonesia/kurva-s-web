import type {
  ProjectTaskBoqCategory,
  ProjectTaskBoqNode,
  ProjectTaskBoqTaskSummary,
} from '../api/get-project-tasks-boq';
import type { ProjectTreeItem } from '../types/manpower-planning';

function pickCategoryTask(
  tasks: ProjectTaskBoqTaskSummary[],
  category: ProjectTaskBoqCategory
): ProjectTaskBoqTaskSummary | undefined {
  return tasks.find((task) => task.taskType === category);
}

export function mapProjectTaskBoqNodesToTreeItems(
  nodes: ProjectTaskBoqNode[],
  category: ProjectTaskBoqCategory
): ProjectTreeItem[] {
  return nodes.map((node) => {
    const task = pickCategoryTask(node.projectTasks, category);

    return {
      id: node.id,
      code: node.code,
      jobItem: node.name,
      jenis: 'Job',
      taskId: task?.id,
      description: task?.description,
      assignee: task?.assignedEmployee?.fullName,
      doneAt: task?.doneAt ?? undefined,
      retryCount: task?.retryCount,
      status: task?.statusLabel,
      isDelegatable: node.isDelegatable,
      doneBy: '-',
      createdBy: '-',
      children:
        node.children.length > 0
          ? mapProjectTaskBoqNodesToTreeItems(node.children, category)
          : undefined,
    };
  });
}
