'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createProjectHierarchyNode } from '../api/create-project-hierarchy-node';
import { updateProjectHierarchyNode } from '../api/update-project-hierarchy-node';
import type {
  CreateProjectHierarchyNodePayload,
  UpdateProjectHierarchyNodePayload,
} from '../types/project-hierarchy-node';

const PROJECT_HIERARCHY_NODES_QUERY_KEY = 'project-hierarchy-nodes';
const PROJECT_HIERARCHY_NODES_LIST_QUERY_KEY = 'project-hierarchy-nodes-list';
const EMPLOYEES_BY_POSITION_QUERY_KEY = 'employees-by-position';

export function useCreateProjectHierarchyNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectHierarchyNodePayload) => createProjectHierarchyNode(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_NODES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_NODES_LIST_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_BY_POSITION_QUERY_KEY] });
      toast.success('Position berhasil ditambahkan.');
    },
    onError: (error) => {
      toast.error('Gagal menambahkan position.', { description: error.message });
    },
  });
}

export function useUpdateProjectHierarchyNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      nodeId,
      payload,
    }: {
      nodeId: string;
      payload: UpdateProjectHierarchyNodePayload;
    }) => updateProjectHierarchyNode(nodeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_NODES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_NODES_LIST_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_BY_POSITION_QUERY_KEY] });
      toast.success('Position berhasil diperbarui.');
    },
    onError: (error) => {
      toast.error('Gagal memperbarui position.', { description: error.message });
    },
  });
}
