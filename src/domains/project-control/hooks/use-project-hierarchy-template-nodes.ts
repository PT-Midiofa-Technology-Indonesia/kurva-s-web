'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProjectHierarchyTemplateNodes } from '../api/get-project-hierarchy-template-nodes';
import {
  createProjectHierarchyTemplateNode,
  deleteProjectHierarchyTemplateNode,
  getProjectHierarchyTemplateNodeDetail,
  updateProjectHierarchyTemplateNode,
} from '../api/project-hierarchy-template-nodes';
import { PROJECT_HIERARCHY_TEMPLATE_LABELS } from '../constants';
import type {
  CreateProjectHierarchyTemplateNodePayload,
  UpdateProjectHierarchyTemplateNodePayload,
} from '../types';
import { PROJECT_HIERARCHY_TEMPLATE_NODES_LIST_QUERY_KEY } from './use-project-hierarchy-template-nodes-infinite';

const PROJECT_HIERARCHY_TEMPLATE_QUERY_KEY = 'project-hierarchy-templates';

export function useProjectHierarchyTemplateNodes(templateId: string) {
  return useQuery({
    queryKey: ['project-hierarchy-template-nodes', templateId],
    queryFn: () => getProjectHierarchyTemplateNodes(templateId),
    enabled: !!templateId,
  });
}

export function useProjectHierarchyTemplateNodeDetail(nodeId: string) {
  return useQuery({
    queryKey: ['project-hierarchy-template-nodes', nodeId],
    queryFn: () => getProjectHierarchyTemplateNodeDetail(nodeId),
    enabled: !!nodeId,
  });
}

export function useCreateProjectHierarchyTemplateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectHierarchyTemplateNodePayload) =>
      createProjectHierarchyTemplateNode(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_TEMPLATE_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [PROJECT_HIERARCHY_TEMPLATE_NODES_LIST_QUERY_KEY],
      });
      toast.success(PROJECT_HIERARCHY_TEMPLATE_LABELS.FEEDBACK.CREATE_SUCCESS);
    },
    onError: (error) => {
      toast.error(PROJECT_HIERARCHY_TEMPLATE_LABELS.FEEDBACK.CREATE_FAILED, {
        description: error.message,
      });
    },
  });
}

export function useUpdateProjectHierarchyTemplateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      nodeId,
      payload,
    }: {
      nodeId: string;
      payload: UpdateProjectHierarchyTemplateNodePayload;
    }) => updateProjectHierarchyTemplateNode(nodeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_TEMPLATE_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [PROJECT_HIERARCHY_TEMPLATE_NODES_LIST_QUERY_KEY],
      });
      toast.success(PROJECT_HIERARCHY_TEMPLATE_LABELS.FEEDBACK.UPDATE_SUCCESS);
    },
    onError: (error) => {
      toast.error(PROJECT_HIERARCHY_TEMPLATE_LABELS.FEEDBACK.UPDATE_FAILED, {
        description: error.message,
      });
    },
  });
}

export function useDeleteProjectHierarchyTemplateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) => deleteProjectHierarchyTemplateNode(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_TEMPLATE_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [PROJECT_HIERARCHY_TEMPLATE_NODES_LIST_QUERY_KEY],
      });
      toast.success(PROJECT_HIERARCHY_TEMPLATE_LABELS.FEEDBACK.DELETE_SUCCESS);
    },
    onError: (error) => {
      toast.error(PROJECT_HIERARCHY_TEMPLATE_LABELS.FEEDBACK.DELETE_FAILED, {
        description: error.message,
      });
    },
  });
}
