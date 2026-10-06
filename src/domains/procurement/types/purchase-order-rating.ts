export interface PurchaseOrderRatingVendor {
  id: string;
  name: string;
}

export interface PurchaseOrderRatingCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderRatingRater {
  id: string;
  name: string;
}

export interface PurchaseOrderRatingSource {
  type: 'purchase_order';
  id: string;
  label: string | null;
  deleted: boolean;
}

export interface PurchaseOrderRatingScore {
  categoryId: string | null;
  categoryCode: string;
  categoryName: string;
  categoryStatus: 'active' | 'inactive' | 'deleted';
  score: number;
  note: string | null;
}

export interface PurchaseOrderRatingRecord {
  id: string;
  ratedAt: string;
  overallScore: number;
  note: string | null;
  ratedBy: PurchaseOrderRatingRater | null;
  source: PurchaseOrderRatingSource;
  scores: PurchaseOrderRatingScore[];
}

export interface PurchaseOrderRatingEnvelope {
  vendor: PurchaseOrderRatingVendor | null;
  activeCategories: PurchaseOrderRatingCategory[];
  rating: PurchaseOrderRatingRecord | null;
}

export interface PurchaseOrderRatingCategoryScoreInput {
  categoryId: string;
  score: number;
  note?: string | null;
}

export interface PurchaseOrderRatingPayload {
  ratedAt: string;
  overallNote?: string | null;
  categoryScores: PurchaseOrderRatingCategoryScoreInput[];
}
