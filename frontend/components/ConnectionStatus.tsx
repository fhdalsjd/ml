"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ConnectionStatusProps {
  lastSyncTime?: Date | null;
  isSyncing?: boolean;
}

export default function ConnectionStatus({ lastSyncTime, isSyncing = false }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);

  useEffect(() => {
    // Check if we have recent sync data (within last 5 minutes)
    if (lastSyncTime) {
      const now = new Date().getTime();
      const lastSync = new Date(lastSyncTime).getTime();
      const fiveMinutes = 5 * 60 * 1000;
      setIsConnected(now - lastSync < fiveMinutes);
    } else {
      setIsConnected(false);
    }
    setConnectionChecked(true);
  }, [lastSyncTime]);

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
        <span>Syncing with MT5...</span>
      </div>
    );
  }

  if (!connectionChecked) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="inline-block h-2 w-2 bg-gray-500 rounded-full animate-pulse" />
        <span>Checking connection...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <span className="inline-block h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        <span>MetaTrader 5 Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-yellow-400">
      <span className="inline-block h-2 w-2 bg-yellow-500 rounded-full" />
      <span>MT5 Not Synced Recently</span>
    </div>
  );
}
