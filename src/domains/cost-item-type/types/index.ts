export interface CostItemType {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CostItemTypeListItem = CostItemType;
