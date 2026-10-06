'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { clearPortal } from '@/shared/lib/portal';
import { clearUserPermissionsCookie } from '@/shared/lib/user-permissions';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import { useSelectedProjectStore } from '@/shared/store/selected-project';

import { logout } from '../api/logout';
import { useAuthStore } from '../store';

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.logout);
  const clearSelectedProject = useSelectedProjectStore((s) => s.clear);
  const clearSelectedCompany = useSelectedCompanyStore((s) => s.clear);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success({ title: TOAST_MESSAGES.SUCCESS.LOGGED_OUT });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
    onSettled: () => {
      clearUserPermissionsCookie();
      clearPortal();
      clearSelectedProject();
      clearSelectedCompany();
      clearAuth();
      router.push('/login');
    },
  });
}
