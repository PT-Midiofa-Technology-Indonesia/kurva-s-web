export interface ProspectClient {
  id: string;
  name: string;
}

export interface ProspectProject {
  id: string;
  code: string;
  name: string;
  description: string;
  currentStage: string;
  currentStageName: string;
  totalDocumentRequirements: number;
  totalUploadedDocuments: number;
  estimatedValue: number;
  projectStartDate: string;
  projectEndDate: string;
  tenderSubmissionDeadline: string | null;
  outcomeReason: string | null;
  isActive: boolean;
  client: ProspectClient;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectStage {
  stage: string;
  stageName: string;
  totalProjects: number;
  projects: ProspectProject[];
}

export interface ProspectDetailCompany {
  id: string;
  name: string;
}

export interface ProspectDetailClient {
  id: string;
  name: string;
}

export interface ProspectDetailCreatedBy {
  id: string;
  name: string;
}

export interface ProspectDetailProjectType {
  id: string;
  name: string;
}

export interface ProspectDetailProjectCapability {
  id: string;
  name: string;
}

export interface ProspectDetail {
  id: string;
  code: string;
  name: string;
  description: string;
  currentStage: string;
  currentStageName: string;
  estimatedValue: number;
  projectStartDate: string;
  projectEndDate: string;
  tenderSubmissionDeadline: string | null;
  outcomeReason: string | null;
  isActive: boolean;
  company: ProspectDetailCompany | null;
  client: ProspectDetailClient | null;
  createdBy: ProspectDetailCreatedBy | null;
  projectType: ProspectDetailProjectType | null;
  projectCapabilities: ProspectDetailProjectCapability[];
  createdAt: string;
  updatedAt: string;
}

export interface ProspectDetailDocumentType {
  id: string;
  code: string;
  name: string;
  allowedFileTypes: string | null;
  allowedFileSize: number | null;
}

export interface ProspectDetailDocument {
  id: string;
  isMandatory: boolean;
  isActive: boolean;
  documentType: ProspectDetailDocumentType;
  uploadedDocuments: ProspectUploadedDocumentFile[];
}

export interface ProspectUploadedDocumentFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedBy: { id: string; name: string };
  uploadedAt: string;
}

export interface ProspectProjectDocumentUploadResult {
  id: string;
  uploadedDocument: ProspectUploadedDocumentFile;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectDetailActivityUploadedBy {
  id: string;
  name: string;
}

export interface ProspectDetailActivityUploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedBy: ProspectDetailActivityUploadedBy;
  uploadedAt: string;
}

export interface ProspectDetailActivityDocument {
  id: string;
  documentType: ProspectDetailDocumentType;
  uploadedDocument: ProspectDetailActivityUploadedDocument;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectDetailActivity {
  id: string | null;
  description: string | null;
  createdBy: ProspectDetailCreatedBy | null;
  createdAt: string | null;
  documents: ProspectDetailActivityDocument[];
}

export interface ProspectDetailResponseData {
  project: ProspectDetail;
  documents: ProspectDetailDocument[];
  activity: ProspectDetailActivity;
}

export interface ActivityDocumentItem {
  id: string;
  name: string;
  url: string;
  size: number;
}

export interface ProjectActivityCreated {
  id: string;
  description: string;
  createdBy: ProspectDetailCreatedBy | null;
  createdAt: string | null;
}

export interface StageHistoryUploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

export interface StageHistoryDocument {
  id: string;
  isMandatory: boolean;
  documentType: ProspectDetailDocumentType;
  uploadedDocuments: ProspectUploadedDocumentFile[];
}

export interface StageHistoryActivityDocument {
  id: string;
  fileName: string;
  fileSize: number;
  url: string;
}

export interface StageHistoryActivity {
  id: string | null;
  description: string | null;
  documents: StageHistoryActivityDocument[];
}

export interface StageHistoryEntry {
  stage: string;
  stageName: string;
  enteredAt: string | null;
  documents: StageHistoryDocument[];
  activity: StageHistoryActivity | null;
}

export interface CreateProspectPayload {
  companyId: string;
  title: string;
  clientName: string;
  estimatedValue: number;
  projectStartDate: string;
  projectEndDate: string;
  description?: string;
  projectTypeId: string | null;
  projectCapabilityIds: string[];
  tenderSubmissionDeadline: string | null;
  outcomeReason: string | null;
}
