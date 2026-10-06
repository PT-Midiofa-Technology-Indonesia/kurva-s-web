import { useEffect, useState } from 'react';

import { throttledToast } from '@/lib/toast';

interface NetworkConnection {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [hasBeenOffline, setHasBeenOffline] = useState(false);
  const [connection, setConnection] = useState<NetworkConnection>({});

  useEffect(() => {
    const conn = (navigator as any).connection;

    const updateConnection = () => {
      if (!conn) return;
      setConnection({
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
      });

      // Warn when on a slow connection type
      if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
        throttledToast.warning(
          'Your connection is very slow. Some features may not work properly.'
        );
      } else if (conn.effectiveType === '3g') {
        throttledToast.info('Your connection is slow. Loading may take longer than usual.');
      }
    };

    if (conn) {
      updateConnection();
      conn.addEventListener('change', updateConnection);
    }

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasBeenOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (conn) {
        conn.removeEventListener('change', updateConnection);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, hasBeenOffline, connection };
}
