export interface SkillLevel {
  id: string;
  code: string;
  name: string;
  levelOrder: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillLevelListItem extends SkillLevel {}

export interface SkillCategory {
  id: string;
  groupId: string | null;
  group: string | null;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategoryListItem extends SkillCategory {}

export interface SkillCategoryRef {
  id: string;
  name: string;
}

export interface SkillLevelRef {
  id: string;
  name: string;
}

export interface SkillCatalog {
  id: string;
  groupId: string | null;
  group: SkillCategoryRef | null;
  skillCategoryId: string;
  skillCategory: SkillCategoryRef;
  skillLevelId: string;
  skillLevel: SkillLevelRef;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillCatalogListItem extends SkillCatalog {}
