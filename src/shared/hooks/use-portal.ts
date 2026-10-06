import { useEffect, useState } from 'react';
import { getPortal, type PortalType } from '@/shared/lib/portal';

export function usePortal() {
  const [portal, setPortalState] = useState<PortalType | null>(null);
  const [isPortalResolved, setIsPortalResolved] = useState(false);

  useEffect(() => {
    setPortalState(getPortal());
    setIsPortalResolved(true);
  }, []);

  return { portal, isPortalResolved };
}
