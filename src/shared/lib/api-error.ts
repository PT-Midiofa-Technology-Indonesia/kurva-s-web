/**
 * API Error Handling
 * Handles error responses following the standard envelope structure
 *
 * Error Response Format:
 * {
 *   "success": false,
 *   "message": "User-facing message in Indonesian",
 *   "data": null,
 *   "errorCode": "MACHINE_READABLE_CODE",
 *   "errors": { "field": ["error message"] } // Optional, for validation errors
 * }
 */

import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

/**
 * Custom error class for API errors
 * Provides structured access to error details from the API response
 */
export class ApiErrorClass extends Error {
  readonly statusCode: number | undefined;
  readonly errorCode: string;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(
    message: string,
    statusCode?: number,
    errorCode: string = 'UNKNOWN',
    fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Extract error information from axios error with proper response typing
 * Type-safe wrapper that handles AxiosError<ApiErrorResponse>
 * For 404s, can optionally return empty paginated response instead of throwing
 */
export function handleApiError(error: unknown, returnEmptyOn404?: false): never;
export function handleApiError<T>(
  error: unknown,
  returnEmptyOn404: true
): ReturnType<typeof getEmptyPaginatedResponse<T>>;
export function handleApiError<T>(
  error: unknown,
  returnEmptyOn404: boolean = false
): never | ReturnType<typeof getEmptyPaginatedResponse<T>> {
  // If already our custom error, re-throw it
  if (error instanceof ApiErrorClass) {
    throw error;
  }

  // Check if it's an axios error with response
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as unknown;

    // Handle 404 errors - return empty response if requested
    if (status === 404 && returnEmptyOn404) {
      const message = isAxiosErrorResponse(data)
        ? (data as { message?: string }).message
        : undefined;
      return getEmptyPaginatedResponse<T>(message);
    }

    // Check if response data follows the error response standard
    if (isApiErrorResponse(data)) {
      throw new ApiErrorClass(data.message, status, data.errorCode, data.errors ?? undefined);
    }

    // Fallback for errors without errorCode but with errors field
    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      data.success === false &&
      'message' in data &&
      ('data' in data ? data.data === null : true)
    ) {
      const d = data as Record<string, unknown>;
      const errorCode =
        'errorCode' in d && typeof d.errorCode === 'string' ? d.errorCode : 'UNKNOWN';
      const errors =
        'errors' in d && d.errors && typeof d.errors === 'object' && !Array.isArray(d.errors)
          ? (d.errors as Record<string, string[]>)
          : undefined;
      throw new ApiErrorClass(d.message as string, status, errorCode, errors);
    }

    // Fallback for errors without proper envelope - data is not ApiErrorResponse
    const fallbackMessage = isAxiosErrorResponse(data)
      ? (data as { message?: string }).message
      : undefined;
    const message = fallbackMessage || error.message || 'Terjadi kesalahan';

    throw new ApiErrorClass(message, status, 'UNKNOWN');
  }

  // Fallback for non-axios errors
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
  throw new ApiErrorClass(message, undefined, 'UNKNOWN');
}

/**
 * Type guard to check if data is a basic axios error response (not necessarily ApiErrorResponse)
 */
function isAxiosErrorResponse(data: unknown): boolean {
  return typeof data === 'object' && data !== null && 'message' in data;
}

/**
 * Type guard to check if error is AxiosError
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    'config' in error &&
    'isAxiosError' in error
  );
}

/**
 * Type guard to check if response data follows ApiErrorResponse structure
 */
export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    data.success === false &&
    'message' in data &&
    'data' in data &&
    data.data === null
  );
}

/**
 * Get user-friendly error message
 * Returns the message from API response or a fallback
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = 'Terjadi kesalahan'
): string {
  if (error instanceof ApiErrorClass) {
    return error.message;
  }

  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (isApiErrorResponse(data)) {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}

/**
 * Get error code for branching logic
 * Use HTTP status code for category, errorCode for specific cases
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof ApiErrorClass) {
    return error.errorCode;
  }

  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (isApiErrorResponse(data)) {
      return data.errorCode;
    }
  }

  return 'UNKNOWN';
}

/**
 * Get validation errors (per-field errors)
 * Only present for VALIDATION_ERROR errorCode
 */
export function getFieldErrors(error: unknown): Record<string, string[]> | undefined {
  if (error instanceof ApiErrorClass) {
    return error.fieldErrors;
  }

  if (isAxiosError(error)) {
    const responseData = error.response?.data;

    if (isApiErrorResponse(responseData) && responseData.errors) {
      return responseData.errors;
    }

    if (
      responseData &&
      typeof responseData === 'object' &&
      'success' in responseData &&
      (responseData as any).success === false &&
      'errors' in responseData &&
      (responseData as any).errors &&
      typeof (responseData as any).errors === 'object' &&
      !Array.isArray((responseData as any).errors)
    ) {
      return (responseData as any).errors as Record<string, string[]>;
    }
  }

  return undefined;
}

/**
 * Get HTTP status code from error
 */
export function getStatusCode(error: unknown): number | undefined {
  if (error instanceof ApiErrorClass) {
    return error.statusCode;
  }

  if (isAxiosError(error)) {
    return error.response?.status;
  }

  return undefined;
}

/**
 * Import validation error structure from API
 */
export interface ImportValidationError<TFailedRow> {
  message?: string;
  failed_count: number;
  failed_rows: TFailedRow[];
}

/**
 * Structure of the errors object within IMPORT_VALIDATION_ERROR response
 */
interface ImportErrors {
  failed_count?: number;
  failed_rows?: unknown[];
}

/**
 * Handle import validation errors (IMPORT_VALIDATION_ERROR)
 * Returns structured import result on validation error, or re-throws via handleApiError
 *
 * @param error - The caught error
 * @param mapFailedRow - Optional mapper to transform raw failed_row data to your type
 * @returns ImportValidationError if it's an import validation error
 * @throws ApiErrorClass for all other errors
 *
 * @example
 * ```typescript
 * catch (error) {
 *   return handleImportError<VendorItemCatalogImportFailedRow>(error);
 * }
 * ```
 */
export function handleImportError<TFailedRow>(
  error: unknown,
  mapFailedRow?: (raw: unknown) => TFailedRow
): ImportValidationError<TFailedRow> {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as Record<string, unknown> | undefined;
    if (responseData?.errorCode === 'IMPORT_VALIDATION_ERROR') {
      const errors = responseData.errors as ImportErrors | undefined;
      const failedRows = (errors?.failed_rows ?? []) as TFailedRow[];
      return {
        message: responseData.message as string,
        failed_count: errors?.failed_count ?? 0,
        failed_rows: mapFailedRow ? failedRows.map(mapFailedRow) : failedRows,
      };
    }
  }
  handleApiError(error);
}

/**
 * Get empty paginated response for 404 errors
 * Used internally when list endpoints return 404
 */
function getEmptyPaginatedResponse<T>(message?: string): {
  success: true;
  message: string;
  data: T[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    from: null;
    to: null;
  };
  links: { first: string; last: string; prev: null; next: null };
} {
  return {
    success: true,
    message: message || 'Data tidak ditemukan',
    data: [],
    meta: { currentPage: 1, perPage: 10, total: 0, lastPage: 1, from: null, to: null },
    links: { first: '', last: '', prev: null, next: null },
  };
}

/**
 * Example 1: API Call with Proper Error Typing
 *
 * ```typescript
 * import { handleApiError } from '@/lib/api-error';
 * import { api } from '@/lib/axios';
 * import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/api';
 * import type { AxiosError } from 'axios';
 *
 * export async function getUser(userId: string): Promise<User> {
 *   try {
 *     const { data } = await api.get<ApiSuccessResponse<User>>(`/v1/users/${userId}`);
 *     return data.data;
 *   } catch (error: AxiosError<ApiErrorResponse> | unknown) {
 *     // error is properly typed as AxiosError<ApiErrorResponse>
 *     handleApiError(error); // Throws ApiErrorClass with structured error info
 *   }
 * }
 * ```
 *
 * Example 2: React Query with Error Handling
 *
 * ```typescript
 * import { getErrorMessage, getFieldErrors } from '@/lib/api-error';
 * import type { ApiErrorResponse } from '@/types/api';
 * import type { AxiosError } from 'axios';
 *
 * const { mutate, isPending } = useMutation({
 *   mutationFn: getUser,
 *   onError: (error: AxiosError<ApiErrorResponse> | unknown) => {
 *     // error properly typed as AxiosError<ApiErrorResponse>
 *     const message = getErrorMessage(error);
 *     toast.error(message); // Shows user-facing message from API in Indonesian
 *
 *     const fieldErrors = getFieldErrors(error);
 *     if (fieldErrors) {
 *       form.setErrors(fieldErrors); // { email: ['Email sudah terdaftar'] }
 *     }
 *   },
 * });
 * ```
 *
 * Example 3: Direct Error Handling in Components
 *
 * ```typescript
 * import { getErrorMessage, getErrorCode } from '@/lib/api-error';
 * import type { ApiErrorResponse } from '@/types/api';
 * import type { AxiosError } from 'axios';
 *
 * async function handleSubmit(formData: CreateUserRequest) {
 *   try {
 *     await createUser(formData);
 *     toast.success('User created');
 *   } catch (error: AxiosError<ApiErrorResponse> | unknown) {
 *     const code = getErrorCode(error);
 *
 *     if (code === 'VALIDATION_ERROR') {
 *       const fieldErrors = getFieldErrors(error);
 *       form.setErrors(fieldErrors);
 *     } else if (code === 'TOKEN_EXPIRED') {
 *       window.location.href = '/login';
 *     } else {
 *       toast.error(getErrorMessage(error));
 *     }
 *   }
 * }
 * ```
 */
