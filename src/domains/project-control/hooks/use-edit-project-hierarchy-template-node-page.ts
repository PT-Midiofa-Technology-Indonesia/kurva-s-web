'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { usePermissionGroups } from '@/domains/role-permissions/hooks/use-permission-groups';
import { transformPermissionGroups } from '@/domains/role-permissions/services/transform-permissions';
import { getFieldErrors } from '@/shared/lib/api-error';
import type {
  CreateProjectHierarchyTemplateNodePayload,
  UpdateProjectHierarchyTemplateNodePayload,
} from '../types';
import {
  useProjectHierarchyTemplateNodeDetail,
  useUpdateProjectHierarchyTemplateNode,
} from './use-project-hierarchy-template-nodes';

export function useEditProjectHierarchyTemplateNodePage(props: {
  templateId: string;
  nodeId: string;
}) {
  const { templateId, nodeId } = props;
  const router = useRouter();

  const { data: nodeDetailData, isLoading: isLoadingNode } =
    useProjectHierarchyTemplateNodeDetail(nodeId);

  const { data: permissionGroupsData } = usePermissionGroups({ workspace: 'project' });

  const { mutateAsync: updateNode, isPending } = useUpdateProjectHierarchyTemplateNode();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] =
    useState<UpdateProjectHierarchyTemplateNodePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const nodeDetail = nodeDetailData?.data;

  const initialValues = useMemo(() => {
    if (!nodeDetail) return undefined;
    return {
      positionId: nodeDetail.positionId,
      parentId: nodeDetail.parent?.positionId ?? nodeDetail.parentId,
      status: nodeDetail.isActive ? 'active' : 'inactive',
    };
  }, [nodeDetail]);

  const initialPermissions = useMemo(() => {
    if (!nodeDetail || !permissionGroupsData) return undefined;
    return transformPermissionGroups(permissionGroupsData, nodeDetail.permissionIds);
  }, [nodeDetail, permissionGroupsData]);

  const handleBack = useCallback(
    () => router.push(`/project-control/project/${templateId}/detail`),
    [router, templateId]
  );

  const handleBeforeSubmit = useCallback((payload: CreateProjectHierarchyTemplateNodePayload) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { projectHierarchyTemplateId, ...rest } = payload;
    setPendingPayload(rest);
    setServerErrors({});
    setIsDialogOpen(true);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    if (!pendingPayload) return;
    updateNode(
      { nodeId, payload: pendingPayload },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setPendingPayload(null);
          setServerErrors({});
          router.push(`/project-control/project/${templateId}/detail`);
        },
        onError: (error) => {
          const fieldErrors = getFieldErrors(error);
          if (fieldErrors) {
            setServerErrors(fieldErrors);
          }
        },
      }
    );
  }, [pendingPayload, updateNode, nodeId, router, templateId]);

  const handleDialogCancel = useCallback(() => {
    setIsDialogOpen(false);
    setPendingPayload(null);
  }, []);

  return {
    templateId,
    nodeId,
    nodes: nodeDetail?.children ?? [],
    initialValues,
    initialPermissions,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    isLoadingNode,
    serverErrors,
    handleBack,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  };
}
