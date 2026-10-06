'use client';

import { toast as sonnerToast } from 'sonner';
import { CustomToast } from '@/shared/components/molecules/CustomToast';

export type ToastOptions = { title: string; description?: string; id?: string | number };

const _activeToasts = new Map<string, number>();
let _counter = 0;

function _showThrottled(
  type: 'success' | 'error' | 'warning' | 'info' | 'loading',
  message: string
): void {
  if (_activeToasts.has(message)) return;
  _activeToasts.set(message, ++_counter);
  toast[type]({ title: message });
  setTimeout(() => _activeToasts.delete(message), 5000);
}

export const toast = {
  success: (options: ToastOptions) =>
    sonnerToast.custom(
      () => (
        <CustomToast variant="success" title={options.title} description={options.description} />
      ),
      { closeButton: false }
    ),

  error: (options: ToastOptions) =>
    sonnerToast.custom(
      (id) => (
        <CustomToast
          variant="error"
          title={options.title}
          description={options.description}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      { closeButton: false }
    ),

  warning: (options: ToastOptions) =>
    sonnerToast.custom(
      () => (
        <CustomToast variant="warning" title={options.title} description={options.description} />
      ),
      { closeButton: false }
    ),

  info: (options: ToastOptions) =>
    sonnerToast.custom(
      () => <CustomToast variant="info" title={options.title} description={options.description} />,
      { closeButton: false }
    ),

  loading: (options: ToastOptions) =>
    sonnerToast.custom(
      () => (
        <CustomToast variant="loading" title={options.title} description={options.description} />
      ),
      { id: options.id, duration: Infinity, closeButton: false }
    ),

  progress: (id: string, options: { title: string; percent: number }) =>
    sonnerToast.custom(
      () => <CustomToast variant="progress" title={options.title} percent={options.percent} />,
      { id, duration: Infinity, closeButton: false }
    ),

  dismiss: (id: string | number) => sonnerToast.dismiss(id),
};

export const throttledToast = {
  success: (message: string) => _showThrottled('success', message),
  error: (message: string) => _showThrottled('error', message),
  warning: (message: string) => _showThrottled('warning', message),
  info: (message: string) => _showThrottled('info', message),
  loading: (message: string) => _showThrottled('loading', message),
};
