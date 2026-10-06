export interface UserListItem {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: {
    id: string;
    name: string;
  };
  userType: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  isActive: boolean;
  roleId: string;
  roleName: string;
  companyId: string | null;
  companyName: string | null;
  employeeId: string | null;
  employeeName: string | null;
}

export interface CreateUserPayload {
  userType: 'employee' | 'non_employee';
  name: string;
  email: string;
  phone: string;
  roleId: string;
  isActive: boolean;
  password?: string;
  companyId?: string | null;
  employeeId?: string | null;
}

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  userType?: string;
  role: {
    id: number | string;
    name: string;
  } | null;
  companyId?: string | null;
  companyName?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  createdAt: string;
  updatedAt: string;
}
