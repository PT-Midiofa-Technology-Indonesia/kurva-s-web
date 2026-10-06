import { useMutation } from '@tanstack/react-query';

import { getErrorCode, getErrorMessage, getFieldErrors } from '@/lib/api-error';

import { login } from '../api/login';
import { useAuthStore } from '../store';
import type { AuthTokenData, LoginCredentials } from '../types';

export interface UseLoginError {
  message: string;
  code: string;
  fieldErrors?: Record<string, string[]>;
}

export interface UseLoginOptions {
  onSuccess?: (data: AuthTokenData) => void;
  onError?: (error: UseLoginError) => void;
}

export function useLogin(options?: UseLoginOptions) {
  const setAuthState = useAuthStore((s) => s.setAuthState);

  return useMutation({
    mutationFn: (values: LoginCredentials) => login(values),
    onSuccess: (data) => {
      setAuthState(data);
      options?.onSuccess?.(data);
    },
    onError: (error: unknown) => {
      const errorInfo: UseLoginError = {
        message: getErrorMessage(error),
        code: getErrorCode(error),
        fieldErrors: getFieldErrors(error),
      };
      options?.onError?.(errorInfo);
    },
  });
}
