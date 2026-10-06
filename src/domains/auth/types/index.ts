import type { PortalType } from '@/shared/lib/portal';

export interface Workspace {
  id: string;
  name: string;
  code: PortalType;
  isActive: boolean;
}

export interface AuthTokenData {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface UserCompany {
  id: string;
  name: string;
  isActive: boolean;
}

export interface UserProject {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  companies: UserCompany[];
  projects: UserProject[];
  userType: string;
  roles: { id: number; name: string; permissions: string[] }[];
  permissions: string[];
  createdAt: string;
}

export interface LoginCredentials {
  identity: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
