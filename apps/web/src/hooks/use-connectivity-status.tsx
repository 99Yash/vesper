"use client";

import React from "react";
import { useAblyContext } from "~/components/ably-provider";
import { useReplicache } from "./use-replicache";

export const useConnectivityStatus = () => {
  const { rep } = useReplicache();
  const ably = useAblyContext();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);

  // Browser online/offline detection
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate overall status
  const overallStatus = React.useMemo(() => {
    if (!isOnline) return 'offline';
    
    // If both Replicache and Ably are available, we're online
    if (rep && ably) return 'online';
    
    // If there are connection issues but we're online, show error
    if (isOnline && (!rep || !ably)) {
      return 'error';
    }
    
    return 'online';
  }, [isOnline, rep, ably]);

  // Update last sync time when we go online
  React.useEffect(() => {
    if (isOnline && rep && ably) {
      setLastSyncTime(new Date());
    }
  }, [isOnline, rep, ably]);

  return {
    isOnline,
    isReplicacheConnected: !!rep,
    isAblyConnected: !!ably,
    pendingMutations: 0, // We'll implement this later if needed
    lastSyncTime,
    overallStatus,
  };
};
