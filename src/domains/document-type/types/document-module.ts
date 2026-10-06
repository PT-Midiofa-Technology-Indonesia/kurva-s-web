export interface ModuleDocument {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface DocumentModule {
  module: string;
  mandatoryDocs: ModuleDocument[];
  optionalDocs: ModuleDocument[];
}

export interface SyncDocumentPayload {
  documentTypeId: string;
  isMandatory: boolean;
  isActive: boolean;
}

export interface SyncModuleRequest {
  documents: SyncDocumentPayload[];
}
