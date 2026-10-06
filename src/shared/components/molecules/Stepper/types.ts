import { ReactNode } from 'react';

export interface StepItem {
  key: string;
  label: string;
  content: ReactNode;
  isLoading?: boolean;
  loadingFallback?: ReactNode;
}
