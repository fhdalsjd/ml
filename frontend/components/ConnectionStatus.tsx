"use client";

import { useEffect, useState } from "react";

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://ml-h6qf.onrender.com";
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${apiUrl}/api/user/me/sync-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.last_sync_time) {
            const lastSync = new Date(data.last_sync_time).getTime();
            const now = new Date().getTime();
            const fiveMinutes = 5 * 60 * 1000;
            setIsConnected(now - lastSync < fiveMinutes);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sync status:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="inline-block h-2 w-2 bg-gray-500 rounded-full animate-pulse" />
        <span>Checking sync...</span>
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
