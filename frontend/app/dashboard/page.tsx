"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatsCards from "@/components/StatsCards";
import TradeChart from "@/components/TradeChart";
import TradeTable from "@/components/TradeTable";
import TradeDetailModal from "@/components/TradeDetailModal";
import ConnectionStatus from "@/components/ConnectionStatus";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut, TrendingUp, Plus, BarChart3 } from "lucide-react";
import { Trade } from "@/components/TradeTable";

export default function DashboardPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const [tradesRes, statsRes] = await Promise.all([
        fetch(`${apiUrl}/api/trades`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (tradesRes.ok) setTrades(await tradesRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/sync-mt5`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchData();
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleSaveTradeNotes = async (
    tradeId: string,
    notes: { emotions: string; mistakes: string; strategy: string; screenshots?: string[] }
  ) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/trades/${tradeId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notes),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            <TrendingUp className="h-8 w-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-gray-300 font-medium">Loading Trading Journal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/10 to-gray-950 text-gray-100">
      {/* Header with glass morphism effect */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-800/50 shadow-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/50">
                <TrendingUp className="h-8 w-8 text-white" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Trading Journal Pro
                </h1>
                <ConnectionStatus lastSyncTime={lastSyncTime} isSyncing={isSyncing} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30 border-0"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync MT5"}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/analytics")}
                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-red-900/50 hover:text-red-300 hover:border-red-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards with enhanced styling */}
        <div className="animate-fade-in">
          <StatsCards stats={stats} />
        </div>

        {/* Performance Chart with glass card */}
        <div className="animate-fade-in-delay-1">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-blue-600/10 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-100">Performance Curve</h2>
                  <p className="text-sm text-gray-400 mt-1">Cumulative P&L over time</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <span>Equity Growth</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <TradeChart trades={trades} />
            </div>
          </div>
        </div>

        {/* Trade History Table with glass card */}
        <div className="animate-fade-in-delay-2">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-purple-600/10 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-100">Trade History</h2>
                  <p className="text-sm text-gray-400 mt-1">Complete journal with notes & analysis</p>
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-500/30">
                  <Plus className="h-4 w-4 mr-2" />
                  New Trade
                </Button>
              </div>
            </div>
            <div className="p-6">
              <TradeTable
                trades={trades}
                onTradeClick={(trade) => {
                  setSelectedTrade(trade);
                  setIsModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTrade(null);
          }}
          onSave={handleSaveTradeNotes}
        />
      )}
    </div>
  );
}