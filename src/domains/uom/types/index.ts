export interface Uom {
  id: string;
  group: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UomListItem extends Uom {}
