export interface ProjectType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  itemType: string;
  itemCategory: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTypeListItem extends ProjectType {}
