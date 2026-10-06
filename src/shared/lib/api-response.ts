/**
 * API Response handling utilities
 * All API responses follow the standard envelope structure defined in @/types/api
 */

import type { AxiosResponse } from 'axios';
import type {
  ApiErrorResponse,
  ApiPaginatedResponse,
  ApiResponse,
  ApiResponsePaginated,
  ApiSuccessResponse,
} from '@/types/api';

/**
 * Type guard to check if response is a success response
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error response
 */
export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false
  );
}

/**
 * Type guard to check if response is paginated
 */
export function isApiPaginated<T>(
  response: ApiResponse<T> | ApiResponsePaginated<T>
): response is ApiPaginatedResponse<T> {
  return 'meta' in response && 'links' in response;
}

/**
 * Extract data from API response, unwrapping the envelope
 *
 * @example
 * const user = unwrapApiResponse(await api.get<ApiSuccessResponse<User>>('/v1/users/123'));
 * // Returns User object directly
 */
export function unwrapApiResponse<T>(response: AxiosResponse<ApiSuccessResponse<T>>): T;
export function unwrapApiResponse<T>(response: AxiosResponse<ApiPaginatedResponse<T>>): {
  data: T;
  meta: ApiPaginatedResponse<T>['meta'];
  links: ApiPaginatedResponse<T>['links'];
};
export function unwrapApiResponse<T>(
  response: AxiosResponse<ApiSuccessResponse<T> | ApiPaginatedResponse<T>>
) {
  if (isApiPaginated(response.data)) {
    return {
      data: response.data.data,
      meta: response.data.meta,
      links: response.data.links,
    };
  }

  return response.data.data;
}

/**
 * Example: How to structure a simple API call
 *
 * ```typescript
 * // File: src/domains/users/api/get-user.ts
 * import { api } from '@/lib/axios';
 * import type { ApiSuccessResponse } from '@/types/api';
 * import type { User } from '../types';
 *
 * export async function getUser(userId: string): Promise<User> {
 *   try {
 *     const { data } = await api.get<ApiSuccessResponse<User>>(`/v1/users/${userId}`);
 *     return data.data;
 *   } catch (error) {
 *     throw new Error(
 *       error instanceof Error ? `Failed to fetch user: ${error.message}` : 'Failed to fetch user'
 *     );
 *   }
 * }
 * ```
 */

/**
 * Example: How to structure a paginated list API call
 *
 * ```typescript
 * // File: src/domains/users/api/get-users.ts
 * import { api } from '@/lib/axios';
 * import type { ApiPaginatedResponse } from '@/types/api';
 * import type { User } from '../types';
 *
 * export interface GetUsersParams {
 *   page?: number;
 *   perPage?: number;
 *   search?: string;
 * }
 *
 * export async function getUsers(params: GetUsersParams = {}) {
 *   try {
 *     const { data } = await api.get<ApiPaginatedResponse<User[]>>('/v1/users', { params });
 *     return {
 *       users: data.data,
 *       meta: data.meta,
 *       links: data.links,
 *     };
 *   } catch (error) {
 *     throw new Error(
 *       error instanceof Error ? `Failed to fetch users: ${error.message}` : 'Failed to fetch users'
 *     );
 *   }
 * }
 * ```
 */

/**
 * Example: How to structure a create/update API call
 *
 * ```typescript
 * // File: src/domains/users/api/create-user.ts
 * import { api } from '@/lib/axios';
 * import type { ApiSuccessResponse } from '@/types/api';
 * import type { User } from '../types';
 *
 * export interface CreateUserRequest {
 *   name: string;
 *   email: string;
 *   password: string;
 * }
 *
 * export async function createUser(request: CreateUserRequest): Promise<User> {
 *   try {
 *     const { data } = await api.post<ApiSuccessResponse<User>>('/v1/users', request);
 *     return data.data;
 *   } catch (error) {
 *     throw new Error(
 *       error instanceof Error ? `Failed to create user: ${error.message}` : 'Failed to create user'
 *     );
 *   }
 * }
 * ```
 */

/**
 * Example: How to structure an operation without return data
 *
 * ```typescript
 * // File: src/domains/auth/api/logout.ts
 * import { api } from '@/lib/axios';
 * import type { ApiSuccessResponse } from '@/types/api';
 *
 * export async function logout(): Promise<void> {
 *   try {
 *     await api.post<ApiSuccessResponse<null>>('/v1/auth/logout', {});
 *   } catch (error) {
 *     throw new Error(
 *       error instanceof Error ? `Failed to logout: ${error.message}` : 'Failed to logout'
 *     );
 *   }
 * }
 * ```
 */
