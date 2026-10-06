export interface ProjectManpowerEmployee {
  id: string;
  code: string;
  name: string;
}

export interface ProjectManpowerPosition {
  id: string;
  code: string;
  name: string;
  level: number;
}

export interface ProjectManpowerParentPosition {
  id: string;
  name: string;
  level: number;
}

export interface ProjectManpowerHierarchy {
  assignmentId: string;
  nodeId: string;
  assignedAt: string | null;
  position: ProjectManpowerPosition | null;
  parentPosition: ProjectManpowerParentPosition | null;
}

export interface ProjectManpowerRatingCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectManpowerRatingScore {
  categoryId: string | null;
  categoryCode: string;
  categoryName: string;
  categoryStatus: 'active' | 'inactive' | 'deleted';
  score: number;
  note: string | null;
}

export interface ProjectManpowerRatingRater {
  id: string;
  name: string;
}

export interface ProjectManpowerRatingSource {
  type: 'project';
  id: string;
  label: string | null;
  deleted: boolean;
}

export interface ProjectManpowerRatingRecord {
  id: string;
  ratedAt: string;
  overallScore: number;
  note: string | null;
  ratedBy: ProjectManpowerRatingRater | null;
  source: ProjectManpowerRatingSource;
  scores: ProjectManpowerRatingScore[];
}

export interface ProjectManpowerListItem {
  employee: ProjectManpowerEmployee | null;
  hierarchy: ProjectManpowerHierarchy;
  rating: ProjectManpowerRatingRecord | null;
}

export interface ProjectManpowerRatingEnvelope {
  employee: ProjectManpowerEmployee | null;
  activeCategories: ProjectManpowerRatingCategory[];
  rating: ProjectManpowerRatingRecord | null;
}

export interface ProjectManpowerRatingCategoryScoreInput {
  categoryId: string;
  score: number;
  note?: string | null;
}

export interface ProjectManpowerRatingPayload {
  ratedAt: string;
  overallNote?: string | null;
  categoryScores: ProjectManpowerRatingCategoryScoreInput[];
}
