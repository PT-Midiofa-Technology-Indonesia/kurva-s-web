import type { MomDetail, MomRow } from '../types';
import type { MeetingApiResponse } from '../types/api';
import { unflattenTasksToTodoTree } from '../utils/todo-tree.utils';

export function mapMeetingToRow(meeting: MeetingApiResponse): MomRow {
  return {
    id: meeting.id,
    companyId: meeting.company.id,
    title: meeting.title,
    startAt: meeting.startAt,
    endAt: meeting.endAt,
    location: meeting.location,
    status: meeting.status,
  };
}

export function mapMeetingToDetail(meeting: MeetingApiResponse): MomDetail {
  return {
    id: meeting.id,
    companyId: meeting.company.id,
    companyName: meeting.company.name,
    title: meeting.title,
    projectIds: meeting.projects.map((project) => project.id),
    projects: meeting.projects.map((project) => ({ id: project.id, name: project.name })),
    location: meeting.location,
    participantIds: meeting.participants.map((participant) => participant.id),
    participantNames: meeting.participants.map((participant) => participant.name),
    startAt: meeting.startAt,
    endAt: meeting.endAt,
    topic: meeting.topic,
    decision: meeting.decision,
    todo: unflattenTasksToTodoTree(meeting.tasks),
    status: meeting.status,
  };
}
