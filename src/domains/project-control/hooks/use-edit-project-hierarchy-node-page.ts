'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { usePermissionGroups } from '@/domains/role-permissions/hooks/use-permission-groups';
import { transformPermissionGroups } from '@/domains/role-permissions/services/transform-permissions';
import { getFieldErrors } from '@/shared/lib/api-error';
import type { UpdateProjectHierarchyNodePayload } from '../types/project-hierarchy-node';
import { useProjectHierarchyNodeDetail } from './use-project-hierarchy-node-detail';
import { useUpdateProjectHierarchyNode } from './use-project-hierarchy-nodes-mutations';

export function useEditProjectHierarchyNodePage(props: { projectId: string; nodeId: string }) {
  const { projectId, nodeId } = props;
  const router = useRouter();

  const { data: nodeDetailData, isLoading: isLoadingNode } = useProjectHierarchyNodeDetail(nodeId);

  const { data: permissionGroupsData } = usePermissionGroups({ workspace: 'project' });

  const { mutateAsync: updateNode, isPending } = useUpdateProjectHierarchyNode();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateProjectHierarchyNodePayload | null>(
    null
  );
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const nodeDetail = nodeDetailData?.data;

  const initialValues = useMemo(() => {
    if (!nodeDetail) return undefined;

    // assignments: [{ id, name }] — employee yang sudah ter-assign di node ini
    const assignments = nodeDetail.assignments ?? [];
    const employeeIds = assignments.map((a) => a.id);
    const positionId = nodeDetail.position?.id ?? nodeDetail.positionId;

    return {
      positionId,
      parentId: nodeDetail.parentId ?? nodeDetail.parent?.id ?? null,
      status: nodeDetail.isActive ? 'active' : 'inactive',
      departmentId: null,
      employeeIds,
      positionOption: nodeDetail.position
        ? {
            value: positionId,
            label: `${nodeDetail.position.code} - ${nodeDetail.position.name}`,
          }
        : undefined,
      employeeOptions: assignments.map((a) => ({ value: a.id, label: a.name })),
    };
  }, [nodeDetail]);

  const initialPermissions = useMemo(() => {
    if (!nodeDetail || !permissionGroupsData) return undefined;
    return transformPermissionGroups(permissionGroupsData, nodeDetail.permissionIds);
  }, [nodeDetail, permissionGroupsData]);

  const handleBack = useCallback(
    () => router.push(`/project-control/project/${projectId}/project-hierarchy`),
    [router, projectId]
  );

  const handleBeforeSubmit = useCallback((payload: UpdateProjectHierarchyNodePayload) => {
    const { employeeIds, ...rest } = payload;
    setPendingPayload({ ...rest, employeeIds: employeeIds ?? [] });
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
          router.push(`/project-control/project/${projectId}/project-hierarchy`);
        },
        onError: (error) => {
          const fieldErrors = getFieldErrors(error);
          if (fieldErrors) {
            setServerErrors(fieldErrors);
          }
        },
      }
    );
  }, [pendingPayload, updateNode, nodeId, router, projectId]);

  const handleDialogCancel = useCallback(() => {
    setIsDialogOpen(false);
    setPendingPayload(null);
  }, []);

  return {
    projectId,
    nodeId,
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
