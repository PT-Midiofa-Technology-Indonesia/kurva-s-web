export type AttendanceStatus =
  | 'present'
  | 'late'
  | 'absent'
  | 'sick'
  | 'leave'
  | 'dayoff'
  | 'halfday'
  | 'very_late'
  | 'early'
  | 'ontime';

export interface AttendanceEmployee {
  id: string;
  code: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
}

export interface AttendanceProject {
  id: string;
  name: string;
}

export interface AttendanceLocation {
  id: string;
  name: string;
}

export interface AttendanceSelfies {
  checkIn?: string | null;
  checkOut?: string | null;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employee?: AttendanceEmployee | null;
  selfies?: AttendanceSelfies | null;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workHour: number;
  workStartTime: string;
  workEndTime: string;
  locationType: string;
  locationId: string;
  locationName: string;
  location?: AttendanceLocation | null;
  projectId: string | null;
  projectName: string | null;
  project?: AttendanceProject | null;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
  timezone?: string;
  workHourSetting?: {
    startTime: string;
    endTime: string;
    timezone?: string;
  };
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkInDistanceMeters?: number | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
  checkOutDistanceMeters?: number | null;
  isActive?: boolean;
}

export interface AttendanceListItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employee?: AttendanceEmployee | null;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workHour: number;
  locationType: string;
  locationName: string;
  location?: AttendanceLocation | null;
  projectName: string | null;
  project?: AttendanceProject | null;
}

export interface CalculateAttendanceStatusPayload {
  employeeId: string;
  checkIn: string;
  checkOut: string;
}

export interface CalculateAttendanceStatusResponseData {
  employeeId: string;
  status: AttendanceStatus;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workHour: number;
  workStartTime: string;
  workEndTime: string;
  locationType: string;
  locationId: string;
  locationName: string;
  projectId: string;
  projectName: string;
}

export interface BulkAttendanceItem {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  locationType: string;
  locationId: string;
  locationName: string;
  projectId: string | null;
  projectName: string | null;
  project?: {
    id: string;
    name: string;
  } | null;
  hasExistingRecord: boolean;
  existingAttendanceId?: string | null;
}

export interface BulkAttendancePayloadItem {
  employeeId: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  locationType: string;
  locationId: string;
  projectId: string | null;
  workHour: number | null;
  timezone: string;
  notes: string | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkInDistanceMeters: number | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  checkOutDistanceMeters: number | null;
}

export interface UpdateAttendancePayload {
  employeeId: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  locationType: string;
  locationId: string | null;
  projectId: string | null;
  timezone?: string;
  notes?: string | null;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkInDistanceMeters?: number | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
  checkOutDistanceMeters?: number | null;
  isActive?: boolean;
}
