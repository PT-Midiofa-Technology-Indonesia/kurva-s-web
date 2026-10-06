export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  allowedFileTypes: string | null;
  allowedFileSize: number | null;
  isActive: boolean;
  isProtected?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTypeListItem extends DocumentType {}
