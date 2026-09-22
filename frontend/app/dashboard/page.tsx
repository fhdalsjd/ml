"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatsCards from "@/components/StatsCards";
import TradeChart from "@/components/TradeChart";
import TradeTable from "@/components/TradeTable";
import TradeDetailModal from "@/components/TradeDetailModal";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import { Trade } from "@/components/TradeTable";

export default function DashboardPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

// Remove handleSync and related state usage entirely
// ... existing code ...

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
      <DashboardLayout>
        <LedgerLoading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="animate-fade-in">
          <StatsCards stats={stats} />
        </div>

        {/* Equity Curve */}
        <div className="animate-fade-in-delay-1">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Equity Curve
            </h2>
            <p className="text-sm text-slate-400 mt-1">Cumulative P&L over time</p>
          </div>
          <GlassCard glow="indigo">
            <div className="p-6">
              <TradeChart trades={trades} />
            </div>
          </GlassCard>
        </div>

        {/* Trade History */}
        <div className="animate-fade-in-delay-2">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Trade History</h2>
              <p className="text-sm text-slate-400 mt-1">Complete journal with notes and analysis</p>
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              New Trade
            </Button>
          </div>
          <GlassCard>
            <div className="p-6">
              <TradeTable
                trades={trades}
                onTradeClick={(trade) => {
                  setSelectedTrade(trade);
                  setIsModalOpen(true);
                }}
              />
            </div>
          </GlassCard>
        </div>
      </div>

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
    </DashboardLayout>
  );
}

function LedgerLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm">
        <div className="flex items-baseline justify-between mb-6">
          <span className="font-display text-xl text-white">Loading...</span>
          <span className="font-mono text-xs text-slate-500">preparing dashboard</span>
        </div>
        <div className="space-y-3">
          {[100, 85, 70].map((w, i) => (
            <div key={i} className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"
                style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
