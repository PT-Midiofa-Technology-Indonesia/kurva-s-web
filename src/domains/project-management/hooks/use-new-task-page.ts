'use client';

import { useMemo, useState } from 'react';
import { mapProjectTaskBoqNodesToTreeItems } from '../services/project-task-tree.service';
import type { ProjectTaskCategory, ProjectTreeItem } from '../types/manpower-planning';
import { useProjectTasksBoq } from './use-project-tasks-boq';

export function useNewTaskPage(taskCategory: ProjectTaskCategory = 'control') {
  const apiTaskCategory = taskCategory === 'qc' ? 'qc' : 'work';

  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<ProjectTreeItem[]>([]);

  const { data: boqData, isLoading: isTreeLoading } = useProjectTasksBoq(apiTaskCategory);

  const treeItems = useMemo(
    () => mapProjectTaskBoqNodesToTreeItems(boqData?.boq?.items ?? [], apiTaskCategory),
    [boqData?.boq?.items, apiTaskCategory]
  );

  return {
    project: boqData?.project,
    search,
    setSearch,
    treeItems,
    isTreeLoading,
    selectedItems,
    setSelectedItems,
  };
}
