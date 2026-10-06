import { z } from 'zod';
import { CREATE_MOM_LABELS, GENERAL_TODO_TAB_ID } from '../constants';
import type { TodoNode } from '../types';
import { flattenTodoNodes } from '../utils/todo-tree.utils';

const todoNodeSchema: z.ZodType<TodoNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    task: z.string(),
    taskType: z.enum(['work', 'qc']),
    assignedToEmployeeId: z.string().nullable(),
    assignedToEmployeeName: z.string().nullable(),
    children: z.array(todoNodeSchema),
  })
);

export const createMomSchema = z
  .object({
    title: z.string().min(1, CREATE_MOM_LABELS.VALIDATION.TITLE_REQUIRED),
    companyId: z.string().min(1, CREATE_MOM_LABELS.VALIDATION.COMPANY_REQUIRED),
    projectIds: z.array(z.string()),
    location: z.string().min(1, CREATE_MOM_LABELS.VALIDATION.LOCATION_REQUIRED),
    participantIds: z.array(z.string()).min(1, CREATE_MOM_LABELS.VALIDATION.PARTICIPANTS_REQUIRED),
    startDate: z.string().min(1, CREATE_MOM_LABELS.VALIDATION.START_DATE_REQUIRED),
    startTime: z.string().min(1, CREATE_MOM_LABELS.VALIDATION.START_TIME_REQUIRED),
    endDate: z.string().min(1, CREATE_MOM_LABELS.VALIDATION.END_DATE_REQUIRED),
    endTime: z.string().min(1, CREATE_MOM_LABELS.VALIDATION.END_TIME_REQUIRED),
    topic: z.string().min(1, CREATE_MOM_LABELS.VALIDATION.TOPIC_REQUIRED),
    decision: z.string().min(1, CREATE_MOM_LABELS.VALIDATION.DECISION_REQUIRED),
    todo: z.record(z.string(), z.array(todoNodeSchema)),
  })
  .superRefine((values, ctx) => {
    const hasFilled = [GENERAL_TODO_TAB_ID, ...values.projectIds].some((tabId) =>
      flattenTodoNodes(values.todo[tabId] ?? []).some((node) => node.task.trim().length > 0)
    );
    if (!hasFilled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: CREATE_MOM_LABELS.VALIDATION.TODO_REQUIRED,
        path: ['todo'],
      });
    }
  });

export type CreateMomInput = z.infer<typeof createMomSchema>;
