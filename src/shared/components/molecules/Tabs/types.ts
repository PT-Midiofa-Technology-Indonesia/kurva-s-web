import type { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  content: ReactNode;
  isLoading?: boolean;
  loadingFallback?: ReactNode;
  /** Force unmount/remount content on every tab switch to trigger re-fetch */
  remountOnChange?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  /** Uncontrolled: initial active tab. Defaults to the first item's key. */
  defaultActiveKey?: string;
  /** Controlled: active tab key. Pair with onChange. */
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: 'default' | 'underline' | 'segmented';
  className?: string;
  tabListClassName?: string;
  tabItemClassName?: string;
  contentClassName?: string;
}
