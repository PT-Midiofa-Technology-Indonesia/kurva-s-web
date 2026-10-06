import { useMutation } from '@tanstack/react-query';
import { setWorkspace } from '../api/set-workspace';

export function useSetWorkspace() {
  return useMutation({
    mutationFn: setWorkspace,
  });
}
