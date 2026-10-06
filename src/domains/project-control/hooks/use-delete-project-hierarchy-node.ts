'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteProjectHierarchyNode } from '../api/delete-project-hierarchy-node';

const PROJECT_HIERARCHY_NODES_QUERY_KEY = 'project-hierarchy-nodes';
const PROJECT_HIERARCHY_NODES_LIST_QUERY_KEY = 'project-hierarchy-nodes-list';

export function useDeleteProjectHierarchyNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) => deleteProjectHierarchyNode(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_NODES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_NODES_LIST_QUERY_KEY] });
      toast.success('Position berhasil dihapus.');
    },
    onError: (error) => {
      toast.error('Gagal menghapus position.', { description: error.message });
    },
  });
}
