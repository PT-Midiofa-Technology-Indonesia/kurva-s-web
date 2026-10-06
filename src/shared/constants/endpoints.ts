export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REFRESH_TOKEN: '/auth/refresh-token',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    SET_WORKSPACE: '/auth/set-workspace',
  },
  WORKSPACE: {
    LIST: '/workspaces',
  },
} as const;
