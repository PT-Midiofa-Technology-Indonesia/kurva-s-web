import type { BaseEntity } from '@/shared/types/base-entity';
import type { BaseQueryParams } from '@/shared/types/query-params';

export interface GetProjectsParams extends BaseQueryParams {
  companyId?: string;
  isActive?: boolean;
  currentStage?: string;
  projectSourceCategory?: string;
  page?: number;
  perPage?: number;
  search?: string;
}

export interface Project {
  id: string;
  projectName: string;
  projectOwner: string;
  projectTypeName?: string;
  projectTypeCode?: string;
  projectSourceCategory?: string;
  clientName?: string;
  estimatedValue?: number;
  startedAt?: string | null;
  projectStartDate?: string;
  projectEndDate?: string;
  description?: string;
  status: 'Aktif' | 'Tidak Aktif';
  workStartTime?: string | null;
  workEndTime?: string | null;
  workDays?: string[];
  warehouse?: {
    id: string;
    code: string;
    name: string;
  } | null;
  hasProjectHierarchy: boolean;
  isSideInstruction?: boolean;
  spkNumber?: string;
  spkRequirementDocuments?: SPKRequirementDocument;
  spkUploadedDocuments?: SPKUploadedDocument[];
}

export interface SPKRequirementDocument {
  documentType: {
    id: string;
    code: string;
    name: string;
    isMandatory?: boolean;
    allowedFileTypes: string;
    allowedFileSize: number;
  };
  uploadedDocuments: SPKUploadedDocument[];
}

export interface SPKUploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: string;
}

export interface GetProjectHierarchyTemplatesParams extends BaseQueryParams {
  isActive?: boolean;
}

export interface ProjectCapability {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectHierarchyTemplateListItem extends BaseEntity {
  name: string;
  description: string | null;
  projectCapability: ProjectCapability | null;
  isActive: boolean;
}

export interface ProjectHierarchyTemplateDetail extends ProjectHierarchyTemplateListItem {
  nodes: ProjectHierarchyTemplateNode[];
}

export interface ProjectHierarchyTemplateFormInput {
  id: string | null;
  projectCapabilityId: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface ProjectHierarchyTemplateNodePosition {
  id: string;
  code: string;
  name: string;
  level: number;
  isActive: boolean;
}

export interface ProjectHierarchyTemplateNodeParent {
  id: string;
  projectHierarchyTemplateId: string;
  positionId: string;
  isActive: boolean;
}

export interface ProjectHierarchyTemplateNode extends BaseEntity {
  projectHierarchyTemplateId: string;
  parentId: string | null;
  parent: ProjectHierarchyTemplateNodeParent | null;
  positionId: string;
  position: ProjectHierarchyTemplateNodePosition;
  permissionIds: number[];
  isActive: boolean;
  children?: ProjectHierarchyTemplateNode[];
}

export interface CreateProjectHierarchyTemplateNodePayload {
  projectHierarchyTemplateId: string;
  parentId: string | null;
  positionId: string;
  isActive: boolean;
  permissionIds: number[];
}

export interface UpdateProjectHierarchyTemplateNodePayload {
  parentId: string | null;
  positionId: string;
  isActive: boolean;
  permissionIds: number[];
}

export type ProjectMonitoringViewMode = 'all' | 'day' | 'week' | 'month';

export type {
  ProjectManpowerEmployee,
  ProjectManpowerHierarchy,
  ProjectManpowerListItem,
  ProjectManpowerParentPosition,
  ProjectManpowerPosition,
  ProjectManpowerRatingCategory,
  ProjectManpowerRatingCategoryScoreInput,
  ProjectManpowerRatingEnvelope,
  ProjectManpowerRatingPayload,
  ProjectManpowerRatingRater,
  ProjectManpowerRatingRecord,
  ProjectManpowerRatingScore,
  ProjectManpowerRatingSource,
} from './project-manpower-rating';
