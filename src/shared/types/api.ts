// ============================================================================
// API Response Envelope - Standard Structure for All API Responses
// ============================================================================
// Every API response (success or error) follows this envelope.
// Based on: API Response Standard (Envelope Structure)

/** Pagination metadata for list endpoints */
export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number | null; // null if empty
  to: number | null; // null if empty
}

/** Pagination links for navigation */
export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

/** Success response with single resource or operation result */
export interface ApiSuccessResponse<T = null> {
  success: true;
  message: string; // User-facing message in Indonesian
  data: T;
}

/** Success response with paginated list */
export interface ApiPaginatedResponse<T = unknown[]> {
  success: true;
  message: string;
  data: T extends unknown[] ? T : T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

/** Error response */
export interface ApiErrorResponse {
  success: false;
  message: string; // User-facing message in Indonesian
  data: null;
  errorCode: string; // Machine-readable code in UPPER_SNAKE_CASE
  errors?: Record<string, string[]> | null; // Per-field validation errors
}

/** Union of all possible API responses */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
export type ApiResponsePaginated<T = unknown[]> = ApiPaginatedResponse<T> | ApiErrorResponse;

// ============================================================================
// Standard Error Codes
// ============================================================================
// Machine-readable error codes from API, used for branching logic
// See: src/shared/lib/api-error.ts for error handling utilities

export const STANDARD_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof STANDARD_ERROR_CODES)[keyof typeof STANDARD_ERROR_CODES];

// ============================================================================
// Legacy Error Mapping (Deprecated - Use api-error.ts instead)
// ============================================================================
// Kept for backwards compatibility
// New code should use: src/shared/lib/api-error.ts

export interface ApiError {
  message: string;
  code: ErrorCode;
  errors?: Record<string, string[]>;
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHORIZED: 'Akun anda dinonaktifkan. Silahkan Hubungi HR untuk informasi lebih lanjut.',
  INVALID_CREDENTIALS: 'Email atau Password yang anda masukan salah',
  VALIDATION_ERROR: 'Data yang dimasukan tidak valid',
  TOKEN_EXPIRED: 'Sesi anda telah berakhir. Silahkan login kembali.',
  UNKNOWN: 'Terjadi kesalahan. Silahkan coba lagi.',
};

/**
 * @deprecated Use getErrorMessage() from @/lib/api-error instead
 */
export function mapApiError(response?: ApiErrorResponse, defaultMessage?: string): ApiError {
  if (!response || response.success !== false) {
    return {
      message: defaultMessage ?? ERROR_MESSAGES.UNKNOWN,
      code: 'UNKNOWN',
    };
  }

  const { errorCode, message, errors } = response;

  if (errorCode === 'UNAUTHORIZED') {
    return { message, code: 'UNAUTHORIZED' };
  }

  if (errorCode === 'INVALID_CREDENTIALS') {
    return { message, code: 'INVALID_CREDENTIALS' };
  }

  if (errorCode === 'VALIDATION_ERROR') {
    return {
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      code: 'VALIDATION_ERROR',
      errors: errors ?? undefined,
    };
  }

  if (errorCode === 'TOKEN_EXPIRED') {
    return { message: ERROR_MESSAGES.TOKEN_EXPIRED, code: 'TOKEN_EXPIRED' };
  }

  return {
    message: message || defaultMessage || ERROR_MESSAGES.UNKNOWN,
    code: 'UNKNOWN',
  };
}
