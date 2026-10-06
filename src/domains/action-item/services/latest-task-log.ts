import type { MeetingTaskLogApi } from '../types/api';

export function getLatestTaskLog(
  logs: MeetingTaskLogApi[],
  eventType: string
): MeetingTaskLogApi | null {
  return logs
    .filter((log) => log.eventType === eventType)
    .reduce<MeetingTaskLogApi | null>((latest, current) => {
      if (!latest || new Date(current.createdAt).getTime() > new Date(latest.createdAt).getTime()) {
        return current;
      }
      return latest;
    }, null);
}
