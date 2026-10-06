export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export function getApiPath(path: string): string {
  return `/${API_VERSION}${path}`;
}

// For MSW test handlers — includes the /api base that axios prepends via baseURL.
export function getHandlerPath(path: string): string {
  return `/api/${API_VERSION}${path}`;
}
