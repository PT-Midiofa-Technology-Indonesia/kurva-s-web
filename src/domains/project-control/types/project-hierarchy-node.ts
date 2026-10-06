import type { BaseEntity } from '@/shared/types/base-entity';
import type { ProjectHierarchyTemplateNodePosition } from './index';

export interface ProjectNodeAssignment {
  id: string;
  name: string;
}

export interface ProjectHierarchyNode extends BaseEntity {
  projectId: string;
  parentId: string | null;
  parent: ProjectHierarchyNodeParent | null;
  positionId: string;
  position: ProjectHierarchyTemplateNodePosition;
  permissionIds: number[];
  employeeIds: string[];
  isActive: boolean;
  children?: ProjectHierarchyNode[];
  assignments: ProjectNodeAssignment[];
}

export interface ProjectHierarchyNodeParent {
  id: string;
  projectId: string;
  positionId: string;
  isActive: boolean;
}

export interface CreateProjectHierarchyNodePayload {
  projectId: string;
  parentId: string | null;
  positionId: string;
  isActive: boolean;
  permissionIds: number[];
  employeeIds: string[];
}

export interface UpdateProjectHierarchyNodePayload {
  parentId: string | null;
  positionId: string;
  isActive: boolean;
  permissionIds: number[];
  employeeIds: string[];
}
