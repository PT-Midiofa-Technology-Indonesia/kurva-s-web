'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import {
  Building2,
  Calendar,
  Clock,
  EllipsisVertical,
  Eye,
  FileText,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useProjectSourceCategories } from '@/shared/hooks/use-enums';
import { toTitleCase } from '@/shared/utils/string';
import type { BaseQueryParams } from '@/types/query-params';
import { CancelProjectDialog } from '../components/CancelProjectDialog';
import { ProjectDetailDrawer } from '../components/ProjectDetailDrawer';
import { SelectHierarchyTemplateModal } from '../components/SelectHierarchyTemplateModal';
import { SelectWarehouseModal } from '../components/SelectWarehouseModal';
import { SetWorkHoursModal } from '../components/SetWorkHoursModal';
import { SiteInstructionConfirmModal } from '../components/SiteInstructionConfirmModal';
import { PROJECT_LIST_PAGE_LABELS } from '../constants';
import { useCancelProject } from '../hooks/use-cancel-project';
import { useCreateSideInstruction } from '../hooks/use-create-side-instruction';
import { useGenerateProjectNodesFromTemplate } from '../hooks/use-generate-project-nodes-from-template';
import { useProjects } from '../hooks/use-projects';
import { createProjectListItems } from '../services/project-list.service';
import type { Project } from '../types';

interface ProjectUrlParams extends BaseQueryParams {
  companyId?: string;
  isActive?: string;
  projectSourceCategory?: string;
  [key: string]: string | number | boolean | undefined;
}

const STATUS_OPTIONS = [
  { value: 'true', label: 'Aktif' },
  { value: 'false', label: 'Tidak Aktif' },
];

function ProjectActionsCell({
  row,
  onView,
  onProgressMonitoring,
  onHierarki,
  onSchedule,
  onWorkHours,
  onWarehouse,
  onSiteInstruction,
}: {
  row: Row<Project>;
  onView: (r: Project) => void;
  onProgressMonitoring: (r: Project) => void;
  onHierarki: (r: Project) => void;
  onSchedule: (r: Project) => void;
  onWorkHours: (r: Project) => void;
  onWarehouse: (r: Project) => void;
  onSiteInstruction: (r: Project) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-50">
        <DropdownMenuItem onClick={() => onView(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {PROJECT_LIST_PAGE_LABELS.ACTIONS.VIEW}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onProgressMonitoring(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {PROJECT_LIST_PAGE_LABELS.ACTIONS.PROGRESS_MONITORING}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onHierarki(row.original)}>
          <Settings className="mr-2 h-4 w-4" />
          {PROJECT_LIST_PAGE_LABELS.ACTIONS.HIERARKI}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSchedule(row.original)}>
          <Calendar className="mr-2 h-4 w-4" />
          {PROJECT_LIST_PAGE_LABELS.ACTIONS.SCHEDULE}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onWorkHours(row.original)}>
          <Clock className="mr-2 h-4 w-4" />
          {PROJECT_LIST_PAGE_LABELS.ACTIONS.WORKING_HOURS}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onWarehouse(row.original)}>
          <Building2 className="mr-2 h-4 w-4" />
          {PROJECT_LIST_PAGE_LABELS.ACTIONS.WAREHOUSE}
        </DropdownMenuItem>
        {!row.original.isSideInstruction && row.original.projectTypeCode !== 'lumpsum' && (
          <DropdownMenuItem onClick={() => onSiteInstruction(row.original)}>
            <FileText className="mr-2 h-4 w-4" />
            {PROJECT_LIST_PAGE_LABELS.ACTIONS.SITE_INSTRUCTION}
          </DropdownMenuItem>
        )}

        {/* NOTE: Hidden Sementara */}
        {/* <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onCancel(row.original)}
          className="text-red-600 focus:text-red-600"
        >
          <X className="mr-2 h-4 w-4" />
          {PROJECT_LIST_PAGE_LABELS.ACTIONS.CANCEL_PROJECT}
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProjectListPage() {
  const router = useRouter();
  const { queryParams, setQueryParams } = useQueryParams<ProjectUrlParams>();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [projectToCancel, setProjectToCancel] = useState<Project | null>(null);
  const [isWorkHoursOpen, setIsWorkHoursOpen] = useState(false);
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const [isHierarkiModalOpen, setIsHierarkiModalOpen] = useState(false);
  const [hierarkiTargetProject, setHierarkiTargetProject] = useState<Project | null>(null);
  const [siteInstructionProject, setSiteInstructionProject] = useState<Project | null>(null);

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const search = queryParams.search ?? '';
  const isActiveFilter = queryParams.isActive ?? '';
  const projectSourceCategoryFilter = queryParams.projectSourceCategory ?? '';

  const isActiveParam = isActiveFilter ? isActiveFilter === 'true' : undefined;

  const { data: projectSourceCategoryOptions } = useProjectSourceCategories();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      search: queryParams.search,
      companyId: companyId ?? undefined,
      isActive: isActiveParam,
      currentStage: 'won' as const,
      projectSourceCategory: projectSourceCategoryFilter || undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      queryParams.page,
      queryParams.perPage,
      queryParams.search,
      companyId,
      isActiveParam,
      projectSourceCategoryFilter,
    ]
  );

  const { data: projectsData, isLoading } = useProjects(params);

  const totalItems = projectsData?.meta?.total ?? 0;
  const totalPages = projectsData?.meta?.lastPage ?? 1;

  const cancelMutation = useCancelProject();
  const sideInstructionMutation = useCreateSideInstruction();
  const generateMutation = useGenerateProjectNodesFromTemplate();
  const projects = useMemo(
    () => createProjectListItems(projectsData?.data ?? [], search),
    [projectsData?.data, search]
  );

  const handleView = useCallback((project: any) => {
    setSelectedProject(project);
    setIsDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedProject(null);
  }, []);

  const handleProgressMonitoring = useCallback(
    (project: any) => {
      router.push(`/project-control/project/${project.id}/progress-monitoring`);
    },
    [router]
  );

  const handleCancelConfirm = useCallback(() => {
    if (!projectToCancel) return;
    cancelMutation.mutate(projectToCancel.id, {
      onSuccess: () => setProjectToCancel(null),
    });
  }, [projectToCancel, cancelMutation]);

  const handleStatusFilterChange = useCallback(
    (value: any) => {
      const v = Array.isArray(value) ? value[0] : value;
      setQueryParams({ isActive: v || undefined, page: 1 } as Partial<ProjectUrlParams>);
    },
    [setQueryParams]
  );

  const handleSourceCategoryChange = useCallback(
    (value: any) => {
      const v = Array.isArray(value) ? value[0] : value;
      setQueryParams({
        projectSourceCategory: v || undefined,
        page: 1,
      } as Partial<ProjectUrlParams>);
    },
    [setQueryParams]
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setQueryParams({ search: value || undefined, page: 1 } as Partial<ProjectUrlParams>);
    },
    [setQueryParams]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      setQueryParams({ page, perPage } as Partial<ProjectUrlParams>);
    },
    [setQueryParams]
  );

  const handleHierarkiGenerate = useCallback(
    (templateId: string) => {
      if (!hierarkiTargetProject) return;
      generateMutation.mutate(
        { projectId: hierarkiTargetProject.id, templateId },
        {
          onSuccess: (data) => {
            const projectId = data?.data?.projectId ?? hierarkiTargetProject.id;
            setIsHierarkiModalOpen(false);
            setHierarkiTargetProject(null);
            router.push(
              `/project-control/project/${projectId}/project-hierarchy${companyId ? `?companyId=${companyId}` : ''}`
            );
          },
        }
      );
    },
    [generateMutation, hierarkiTargetProject, router, companyId]
  );

  const handleBOQDetail = useCallback(
    (project: any) => {
      router.push(`/project-control/project/${project.id}/boq`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'projectName',
        header: PROJECT_LIST_PAGE_LABELS.TABLE.PROJECT,
        size: 300,
        cell: ({ row }) => (
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
            onClick={() => handleBOQDetail(row.original)}
          >
            {row.original.projectName}
          </button>
        ),
      },
      {
        accessorKey: 'projectOwner',
        header: PROJECT_LIST_PAGE_LABELS.TABLE.PROJECT_OWNER,
        size: 200,
      },
      {
        accessorKey: 'projectTypeName',
        header: PROJECT_LIST_PAGE_LABELS.TABLE.PROJECT_TYPE,
        size: 200,
        cell: ({ row }) => row.original.projectTypeName,
      },
      {
        accessorKey: 'projectSourceCategory',
        header: PROJECT_LIST_PAGE_LABELS.TABLE.PROJECT_SOURCE_CATEGORY,
        size: 180,
        cell: ({ row }) => toTitleCase(row.original.projectSourceCategory),
      },
      {
        accessorKey: 'status',
        header: PROJECT_LIST_PAGE_LABELS.TABLE.STATUS,
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'Aktif' ? 'success' : 'destructive'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'startedAt',
        header: PROJECT_LIST_PAGE_LABELS.TABLE.START_STATUS,
        size: 150,
        cell: ({ row }) => {
          const isStarted = row.original.startedAt != null;
          return (
            <Badge variant={isStarted ? 'success' : 'warning'}>
              {isStarted
                ? PROJECT_LIST_PAGE_LABELS.TABLE.START_STATUS_STARTED
                : PROJECT_LIST_PAGE_LABELS.TABLE.START_STATUS_NOT_STARTED}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: PROJECT_LIST_PAGE_LABELS.TABLE.ACTION,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <ProjectActionsCell
            row={row}
            onView={handleView}
            onProgressMonitoring={handleProgressMonitoring}
            onHierarki={(r) => {
              if (r.hasProjectHierarchy) {
                // Navigate directly to hierarchy page when project already has hierarchy
                router.push(
                  `/project-control/project/${r.id}/project-hierarchy${companyId ? `?companyId=${companyId}` : ''}`
                );
              } else {
                // Open modal to create/generate hierarchy when project doesn't have one
                setHierarkiTargetProject(r);
                setIsHierarkiModalOpen(true);
              }
            }}
            onSchedule={(r) => {
              router.push(`/project-control/project/${r.id}/schedule`);
            }}
            onWorkHours={(r) => {
              setSelectedProject(r);
              setIsWorkHoursOpen(true);
            }}
            onWarehouse={(r) => {
              setSelectedProject(r);
              setIsWarehouseOpen(true);
            }}
            onSiteInstruction={(r) => {
              setSiteInstructionProject(r);
            }}
          />
        ),
      },
    ],
    [handleView, handleProgressMonitoring, router, handleBOQDetail, companyId]
  );

  const headerActions = (
    <AsyncSelect
      className="w-52"
      options={companyOptions}
      value={companyId ?? null}
      onChange={handleCompanyChange}
      placeholder="Pilih Company"
      isSearchable={false}
      isClearable={false}
    />
  );

  const filters = (
    <div className="flex items-center gap-2">
      <AsyncSelect
        className="w-52"
        options={projectSourceCategoryOptions ?? []}
        placeholder={PROJECT_LIST_PAGE_LABELS.FILTERS.SOURCE_CATEGORY}
        value={projectSourceCategoryFilter || null}
        isSearchable={false}
        onChange={handleSourceCategoryChange}
        isClearable
      />
      <AsyncSelect
        className="w-48 focus:ring-1 ring-primary"
        options={STATUS_OPTIONS}
        placeholder={PROJECT_LIST_PAGE_LABELS.FILTERS.STATUS}
        value={isActiveFilter || ''}
        isSearchable={false}
        onChange={handleStatusFilterChange}
        isClearable
      />
    </div>
  );

  return (
    <>
      <ListPageTemplate<any>
        title={PROJECT_LIST_PAGE_LABELS.PAGE_TITLE}
        headerActions={headerActions}
        data={projects}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Tidak ada data proyek"
        search={search}
        onSearchChange={handleSearchChange}
        toolbarRight={filters}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
      />

      <ProjectDetailDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        project={selectedProject}
      />

      <CancelProjectDialog
        open={projectToCancel !== null}
        onOpenChange={(open) => {
          if (!open) setProjectToCancel(null);
        }}
        onConfirm={handleCancelConfirm}
        isLoading={cancelMutation.isPending}
      />

      {isWorkHoursOpen && selectedProject && (
        <SetWorkHoursModal
          open={isWorkHoursOpen}
          onOpenChange={setIsWorkHoursOpen}
          projectId={selectedProject.id}
          workStartTime={selectedProject.workStartTime}
          workEndTime={selectedProject.workEndTime}
          workDays={selectedProject.workDays}
          readonly={selectedProject.isSideInstruction}
        />
      )}
      <SelectWarehouseModal
        open={isWarehouseOpen}
        onOpenChange={setIsWarehouseOpen}
        projectId={selectedProject?.id ?? ''}
        defaultWarehouse={selectedProject?.warehouse ?? null}
        companyId={companyId}
        readonly={selectedProject?.isSideInstruction}
      />
      <SiteInstructionConfirmModal
        open={siteInstructionProject !== null}
        onOpenChange={(open) => {
          if (!open) setSiteInstructionProject(null);
        }}
        onConfirm={() => {
          if (!siteInstructionProject) return;
          sideInstructionMutation.mutate(siteInstructionProject.id, {
            onSuccess: (response) => {
              const newProjectId = response?.data?.id ?? siteInstructionProject.id;
              setSiteInstructionProject(null);
              router.push(`/project-control/boq-management/${newProjectId}/detail?tab=execution`);
            },
          });
        }}
        isLoading={sideInstructionMutation.isPending}
      />
      <SelectHierarchyTemplateModal
        open={isHierarkiModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsHierarkiModalOpen(false);
            setHierarkiTargetProject(null);
          }
        }}
        projectId={hierarkiTargetProject?.id ?? ''}
        onSelectGenerate={handleHierarkiGenerate}
        onSetManual={() => {
          if (!hierarkiTargetProject) return;
          setIsHierarkiModalOpen(false);
          setHierarkiTargetProject(null);
          router.push(
            `/project-control/project/${hierarkiTargetProject.id}/project-hierarchy${companyId ? `?companyId=${companyId}` : ''}`
          );
        }}
        isGenerating={generateMutation.isPending}
      />
    </>
  );
}
