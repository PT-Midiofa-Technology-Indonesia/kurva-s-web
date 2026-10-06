import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetProjectHierarchyTemplatesParams } from '../api/get-project-hierarchy-templates';
import type { ProjectHierarchyTemplateListItem } from '../types';
import { useDeleteProjectHierarchyTemplate } from './use-delete-project-hierarchy-template';
import { useProjectHierarchyTemplates } from './use-project-hierarchy-templates';
import { useUpdateProjectHierarchyTemplate } from './use-update-project-hierarchy-template';

export interface UseProjectHierarchyTemplatePageOptions {
  params?: GetProjectHierarchyTemplatesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useProjectHierarchyTemplatePage(options?: UseProjectHierarchyTemplatePageOptions) {
  const router = useRouter();
  const {
    data: projectHierarchyTemplatesData,
    isLoading,
    isError,
    refetch,
  } = useProjectHierarchyTemplates(options?.params);
  const { mutate: deleteProjectHierarchyTemplate } = useDeleteProjectHierarchyTemplate();
  const { mutate: updateProjectHierarchyTemplate } = useUpdateProjectHierarchyTemplate();

  const [deleteTarget, setDeleteTarget] = useState<ProjectHierarchyTemplateListItem | null>(null);

  const projectHierarchyTemplates = projectHierarchyTemplatesData?.data || [];
  const totalItems = projectHierarchyTemplatesData?.meta?.total;
  const totalPages = projectHierarchyTemplatesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push('/project-control/project/create');
  };

  const handleEdit = (template: ProjectHierarchyTemplateListItem) => {
    router.push(`/project-control/project/${template.id}/edit`);
  };

  const handleDetail = (template: ProjectHierarchyTemplateListItem) => {
    router.push(`/project-control/project/${template.id}/detail`);
  };

  const handleDeleteClick = (template: ProjectHierarchyTemplateListItem) => {
    setDeleteTarget(template);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteProjectHierarchyTemplate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        refetch();
      },
    });
  };

  const handleIsActiveChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        options?.onUpdateQueryParam?.('isActive', undefined);
      } else {
        options?.onUpdateQueryParam?.('isActive', stringValue);
      }
    },
    [options]
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
    },
    [options]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      options?.onSetQueryParams?.({ sortBy, sortOrder });
    },
    [options]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      options?.onSetQueryParams?.({ page, perPage });
    },
    [options]
  );

  const handleToggleActiveStatus = useCallback(
    (template: ProjectHierarchyTemplateListItem) => {
      if (!template.projectCapability) return;
      updateProjectHierarchyTemplate(
        {
          id: template.id,
          projectCapabilityId: template.projectCapability.id,
          name: template.name,
          description: template.description,
          isActive: !template.isActive,
        },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
    },
    [refetch, updateProjectHierarchyTemplate]
  );

  return {
    projectHierarchyTemplates,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleEdit,
    handleDetail,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    handleToggleActiveStatus,
  };
}
