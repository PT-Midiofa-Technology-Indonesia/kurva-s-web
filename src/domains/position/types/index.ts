export interface SkillCatalogRef {
  id: string;
  code: string;
  name: string;
}

export interface Position {
  id: string;
  code: string;
  name: string;
  level: number;
  description: string | null;
  isActive: boolean;
  skillCatalogIds?: string[];
  skillCatalogs?: SkillCatalogRef[];
  createdAt: string;
  updatedAt: string;
}

export interface PositionListItem extends Position {}
