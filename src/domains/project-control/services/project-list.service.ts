import type { Project } from '../types';

interface ProjectApiCompany {
  id?: string;
  name?: string | null;
}

interface ProjectApiClient {
  id?: string;
  name?: string | null;
}

interface ProjectApiWarehouse {
  id: string;
  code: string;
  name: string;
}

interface ProjectApiProjectType {
  id?: string;
  code?: string | null;
  name?: string | null;
}

export interface ProjectListApiItem {
  id: string;
  name?: string | null;
  projectName?: string | null;
  projectOwner?: string | null;
  projectType?: ProjectApiProjectType | null;
  projectTypeName?: string | null;
  code?: string | null;
  company?: ProjectApiCompany | null;
  client?: ProjectApiClient | null;
  estimatedValue?: number | null;
  projectStartDate?: string | null;
  startDate?: string | null;
  projectEndDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  workStartTime?: string | null;
  workEndTime?: string | null;
  workDays?: string[] | null;
  startedAt?: string | null;
  warehouse?: ProjectApiWarehouse | null;
  hasProjectHierarchy?: boolean | null;
  isSideInstruction?: boolean | null;
  spkNumber?: string | null;
  spkRequirementDocuments?: import('../types').SPKRequirementDocument | null;
  projectSourceCategory?: string | null;
}

function normalizeSearchValue(value: string | null | undefined): string {
  return value?.toLowerCase() ?? '';
}

export function mapProjectListItem(project: ProjectListApiItem): Project {
  return {
    id: project.id,
    projectName: project.name ?? project.projectName ?? '-',
    projectOwner: project.company?.name ?? project.projectOwner ?? '-',
    projectTypeName: project.projectType?.name ?? '-',
    projectTypeCode: project.projectType?.code ?? undefined,
    clientName: project.client?.name ?? undefined,
    estimatedValue: project.estimatedValue ?? undefined,
    projectStartDate: project.projectStartDate ?? project.startDate ?? undefined,
    projectEndDate: project.projectEndDate ?? project.endDate ?? undefined,
    description: project.description ?? undefined,
    status: project.isActive ? 'Aktif' : 'Tidak Aktif',
    workStartTime: project.workStartTime ?? undefined,
    workEndTime: project.workEndTime ?? undefined,
    workDays: project.workDays ?? undefined,
    warehouse: project.warehouse ?? null,
    hasProjectHierarchy: project.hasProjectHierarchy ?? false,
    startedAt: project.startedAt ?? undefined,
    isSideInstruction: project.isSideInstruction ?? undefined,
    spkNumber: project.spkNumber ?? undefined,
    projectSourceCategory: project.projectSourceCategory ?? undefined,
    spkRequirementDocuments: project.spkRequirementDocuments ?? undefined,
  };
}

export function createProjectListItems(projects: ProjectListApiItem[], search?: string): Project[] {
  const normalizedSearch = normalizeSearchValue(search);

  const filteredProjects = !normalizedSearch
    ? projects
    : projects.filter((project) => {
        const searchableValues = [
          project.name,
          project.projectName,
          project.company?.name,
          project.projectOwner,
          project.code,
        ];

        return searchableValues.some((value) =>
          normalizeSearchValue(value).includes(normalizedSearch)
        );
      });

  return filteredProjects.map(mapProjectListItem);
}
