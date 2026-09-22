"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";

interface User {
  id: number;
  email: string;
  username: string;
  api_key: string | null;
}

interface SyncStatus {
  last_sync_time: string | null;
}

export default function ConnectMT5Page() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUserData();
    fetchSyncStatus();
    
    // Poll sync status every 30 seconds
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUser(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/user/me/sync-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSyncStatus(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch sync status:", err);
    }
  };

  const handleRegenerateKey = async () => {
    if (!confirm("Regenerate API key? This will invalidate your current key and stop any running sync client until you update it.")) {
      return;
    }

    try {
      setRegenerating(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/user/me/api-key`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUser(await res.json());
      }
    } catch (err) {
      console.error("Failed to regenerate API key:", err);
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const lastSyncDate = syncStatus?.last_sync_time ? new Date(syncStatus.last_sync_time) : null;
  const timeSinceSync = lastSyncDate ? Date.now() - lastSyncDate.getTime() : null;
  const isRecentlySync = timeSinceSync !== null && timeSinceSync < 10 * 60 * 1000; // 10 minutes

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <span className="h-4 w-px bg-border" />
            <span className="font-display italic text-2xl text-foreground">Connect MT5</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-3xl space-y-8">
        {/* Sync Status */}
        <div className="border border-border rounded-sm p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground">Sync Status</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSyncStatus}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          {lastSyncDate ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isRecentlySync ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-400">Connected</span>
                  </>
                ) : (
                  <>
                    <span className="inline-block h-2 w-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-yellow-400">Not synced recently</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Last synced: {lastSyncDate.toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-gray-500 rounded-full" />
              <span className="text-sm text-gray-400">No trades synced yet</span>
            </div>
          )}
        </div>

        {/* Credentials */}
        <div className="border border-border rounded-sm p-6 bg-card">
          <h2 className="font-display text-xl text-foreground mb-4">Your Credentials</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Use these credentials to configure your MT5 sync client.
          </p>

          <div className="space-y-4">
            {/* User ID */}
            <div>
              <label className="block text-xs font-mono text-primary mb-2">USER_ID</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono">
                  {user.id}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(user.id.toString(), "user_id")}
                >
                  {copied === "user_id" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-mono text-primary mb-2">API_KEY</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono truncate">
                  {user.api_key || "(not generated)"}
                </code>
                {user.api_key && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.api_key!, "api_key")}
                  >
                    {copied === "api_key" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <Button
              onClick={handleRegenerateKey}
              disabled={regenerating}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin" : ""}`} />
              {user.api_key ? "Regenerate API Key" : "Generate API Key"}
            </Button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="border border-border rounded-sm p-6 bg-card">
          <h2 className="font-display text-xl text-foreground mb-4">Setup Instructions</h2>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">1. Install the Sync Client</h3>
              <p>
                Download and install the MT5 sync client from the{" "}
                <code className="px-1 py-0.5 bg-background border border-border rounded text-xs">
                  backend/sync-client
                </code>{" "}
                directory of the repository.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">2. Configure Environment Variables</h3>
              <p className="mb-2">Create a <code className="px-1 py-0.5 bg-background border border-border rounded text-xs">.env</code> file with:</p>
              <pre className="p-3 bg-background border border-border rounded text-xs font-mono overflow-x-auto">
{`# MT5 Connection
MT5_LOGIN=your_mt5_account_number
MT5_PASSWORD=your_mt5_password
MT5_SERVER=your_broker_server

# Backend API
API_URL=${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
API_KEY=${user.api_key || "your_api_key_here"}
MT5_APP_USER_ID=${user.id}

# Sync Settings
SYNC_INTERVAL_MINUTES=5
HISTORY_DAYS=30`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">3. Run the Sync Client</h3>
              <p>Execute the sync client script. It will connect to your MT5 terminal and sync trades every 5 minutes.</p>
            </div>

            <div className="pt-2">
              <a
                href="https://github.com/yourusername/forex-journal/blob/main/backend/sync-client/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View full documentation
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
