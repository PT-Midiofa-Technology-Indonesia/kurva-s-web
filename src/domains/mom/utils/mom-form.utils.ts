import { GENERAL_TODO_TAB_ID } from '../constants';
import type { CreateMomFormValues, MomDetail } from '../types';
import type { MeetingPayload, MeetingTaskPayload } from '../types/api';
import { computeTodoCodes, flattenTodoNodes } from './todo-tree.utils';

export function momDetailToFormValues(detail: MomDetail): CreateMomFormValues {
  const [startDate, startTimeRaw] = detail.startAt.split('T');
  const [endDate, endTimeRaw] = detail.endAt.split('T');
  return {
    title: detail.title,
    companyId: detail.companyId,
    projectIds: detail.projectIds,
    location: detail.location,
    participantIds: detail.participantIds,
    startDate: startDate ?? '',
    startTime: (startTimeRaw ?? '').slice(0, 5),
    endDate: endDate ?? '',
    endTime: (endTimeRaw ?? '').slice(0, 5),
    topic: detail.topic,
    decision: detail.decision,
    todo: detail.todo,
  };
}

export function momFormValuesToMeetingPayload(values: CreateMomFormValues): MeetingPayload {
  const tasks: MeetingTaskPayload[] = [];

  for (const tabId of [GENERAL_TODO_TAB_ID, ...values.projectIds]) {
    const nodes = values.todo[tabId] ?? [];
    const isGeneral = tabId === GENERAL_TODO_TAB_ID;

    const codes = computeTodoCodes(nodes);
    for (const node of flattenTodoNodes(nodes)) {
      if (!node.task.trim()) continue;

      const task: MeetingTaskPayload = {
        code: codes.get(node.id) ?? '',
        title: node.task,
        projectId: isGeneral ? null : tabId,
        taskType: node.taskType,
      };
      if (node.assignedToEmployeeId) {
        task.assignedToEmployeeId = node.assignedToEmployeeId;
      }
      tasks.push(task);
    }
  }

  return {
    title: values.title,
    location: values.location,
    startAt: `${values.startDate} ${values.startTime}:00`,
    endAt: `${values.endDate} ${values.endTime}:00`,
    topic: values.topic,
    decision: values.decision,
    projectIds: values.projectIds,
    participantEmployeeIds: values.participantIds,
    tasks,
  };
}
