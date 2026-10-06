export interface LeaveRecordFilterable {
  code?: string | null;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string | null;
}

export interface LeaveRecordFilterParams {
  search?: string;
  employeeId?: string | null;
  status?: string | string[] | null;
  leaveTypeId?: string | string[] | null;
  leaveTypeIds?: string | string[] | null;
  year?: number | string | null;
}

function toStringArray(value?: string | string[] | null) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

export function filterLeaveRecords<T extends LeaveRecordFilterable>(
  records: T[],
  params: LeaveRecordFilterParams = {}
) {
  const search = (params.search ?? '').trim().toLowerCase();
  const employeeId = params.employeeId ?? '';
  const year = params.year != null ? String(params.year) : '';
  const statuses = toStringArray(params.status);
  const leaveTypeFilters = [
    ...toStringArray(params.leaveTypeId),
    ...toStringArray(params.leaveTypeIds),
  ];

  return records.filter((item) => {
    if (search) {
      const haystack = `${item.code ?? ''} ${item.description ?? ''}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    if (employeeId && item.employeeId !== employeeId) return false;
    if (year && !item.startDate.startsWith(year)) return false;
    if (statuses.length > 0 && !statuses.includes(item.status)) return false;
    if (leaveTypeFilters.length > 0 && !leaveTypeFilters.includes(item.leaveTypeId)) return false;

    return true;
  });
}

export function buildLeaveCode(employeeCode: string, startDate: string, sequence: number) {
  const year = String(new Date(`${startDate}T00:00:00`).getFullYear());
  const serial = String(sequence).padStart(3, '0');

  return `LV/${employeeCode}/${year}/${serial}`;
}
