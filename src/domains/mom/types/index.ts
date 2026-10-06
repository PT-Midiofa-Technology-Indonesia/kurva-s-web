export type MomStatus = 'draft' | 'published' | 'cancelled';

export interface MomRow {
  id: string;
  companyId: string;
  title: string;
  startAt: string;
  endAt: string;
  location: string;
  status: MomStatus;
}

export interface CompanyOption {
  id: string;
  name: string;
}

export interface ProjectOption {
  id: string;
  name: string;
}

export interface ParticipantOption {
  id: string;
  name: string;
}

export type TodoTaskType = 'work' | 'qc';

export interface TodoNode {
  id: string;
  task: string;
  taskType: TodoTaskType;
  assignedToEmployeeId: string | null;
  assignedToEmployeeName: string | null;
  children: TodoNode[];
}

/** To Do trees keyed by tab: a selected project's id (one tab per selected project — no project-less tab). */
export type MomTodoByTab = Record<string, TodoNode[]>;

export interface CreateMomFormValues {
  title: string;
  companyId: string;
  projectIds: string[];
  location: string;
  participantIds: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  topic: string;
  decision: string;
  todo: MomTodoByTab;
}

export interface MomDetail {
  id: string;
  companyId: string;
  /** Display name for `companyId` — the API's detail/create/update responses embed the company name, so this avoids a second lookup. */
  companyName: string;
  title: string;
  projectIds: string[];
  /** Display names for `projectIds`, in the same order — embedded in the API response, so no paginated option list lookup is needed. */
  projects: { id: string; name: string }[];
  location: string;
  participantIds: string[];
  /** Display names for `participantIds`, in the same order — the API's detail/create/update responses embed participant names, so this avoids a second lookup. */
  participantNames: string[];
  startAt: string;
  endAt: string;
  topic: string;
  decision: string;
  todo: MomTodoByTab;
  status: MomStatus;
}
