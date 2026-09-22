import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatsCards from "@/components/StatsCards";
import TradeChart from "@/components/TradeChart";
import TradeTable from "@/components/TradeTable";
import TradeDetailModal from "@/components/TradeDetailModal";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut, TrendingUp, Settings } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

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
      const [tradesRes, statsRes] = await Promise.all([
        fetch("/api/trades", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/stats", { headers: { Authorization: `Bearer ${token}` } }),
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
      const res = await fetch("/api/sync-mt5", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchData();
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span>Loading Forex Journal Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Forex Journal Dashboard</h1>
            <p className="text-sm text-gray-400">MetaTrader 5 Real-Time Account Performance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing MT5..." : "Sync MT5"}
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Performance Chart */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Equity & Profit Growth Curve</h2>
        <TradeChart trades={trades} />
      </div>

      {/* Trade History Table */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Trade History & Analytics</h2>
        <TradeTable
          trades={trades}
          onSelectTrade={(trade) => {
            setSelectedTrade(trade);
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}