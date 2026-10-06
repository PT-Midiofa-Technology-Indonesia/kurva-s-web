import type { MomStatus, TodoTaskType } from './index';

export interface MeetingPersonRef {
  id: string;
  name: string;
}

export interface MeetingCompanyRef {
  id: string;
  name: string;
  code: string;
}

export interface MeetingProjectRef {
  id: string;
  code: string;
  name: string;
}

export interface MeetingParticipantRef {
  id: string;
  name: string;
  code: string;
  role: string | null;
}

export interface MeetingTaskApiResponse {
  id: string;
  meetingId: string;
  projectId: string | null;
  project: MeetingProjectRef | null;
  taskType: TodoTaskType;
  taskTypeLabel: string;
  code: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
  statusLabel: string;
  assignedToEmployee: MeetingPersonRef | null;
  qcDecision: 'pass' | 'fail' | null;
  qcNote: string | null;
  qcAt: string | null;
  retryCount: number;
  doneAt: string | null;
  doneByUser: MeetingPersonRef | null;
  cancelledReason: string | null;
  createdByUser: MeetingPersonRef;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingApiResponse {
  id: string;
  code: string;
  company: MeetingCompanyRef;
  title: string;
  location: string;
  startAt: string;
  endAt: string;
  topic: string;
  decision: string;
  status: MomStatus;
  statusLabel: string;
  publishedAt: string | null;
  publishedByUser: MeetingPersonRef | null;
  cancelledAt: string | null;
  cancelledByUser: MeetingPersonRef | null;
  cancelledReason: string | null;
  createdByUser: MeetingPersonRef;
  projects: MeetingProjectRef[];
  participants: MeetingParticipantRef[];
  tasks: MeetingTaskApiResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingTaskPayload {
  code: string;
  title: string;
  projectId: string | null;
  taskType: TodoTaskType;
  assignedToEmployeeId?: string;
}

export interface MeetingPayload {
  title: string;
  location: string;
  startAt: string;
  endAt: string;
  topic: string;
  decision: string;
  projectIds: string[];
  participantEmployeeIds: string[];
  tasks: MeetingTaskPayload[];
}
