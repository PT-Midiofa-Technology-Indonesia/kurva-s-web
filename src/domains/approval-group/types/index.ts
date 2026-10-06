export interface ApprovalGroup {
  id: string;
  groupId: string | null;
  group: ApprovalGroup | null;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalGroupListItem extends ApprovalGroup {}
