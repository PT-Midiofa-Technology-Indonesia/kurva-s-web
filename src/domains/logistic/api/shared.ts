export function getCompanyHeaders(companyId?: string | null) {
  return companyId ? { 'X-Company-Id': companyId } : undefined;
}

export function unwrapApiArrayResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as { data?: unknown }).data;
    if (Array.isArray(data)) {
      return data as T[];
    }
  }

  return [];
}
