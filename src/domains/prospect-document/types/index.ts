export interface ProspectDocumentType {
  id: string;
  code: string;
  name: string;
}

export interface ProspectDocumentRequirement {
  id: string;
  stage: string;
  isMandatory: boolean;
  notes: string | null;
  isActive: boolean;
  documentType: ProspectDocumentType;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectStageDocument {
  stage: string;
  stageName: string;
  documentRequirements: ProspectDocumentRequirement[];
}

export interface DocumentRequirementPayload {
  documentTypeId: string;
  isMandatory: boolean;
  isActive: boolean;
}

export interface SyncProspectStageDocumentPayload {
  documentRequirements: DocumentRequirementPayload[];
}
