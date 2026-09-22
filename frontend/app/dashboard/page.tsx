"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatsCards from "@/components/StatsCards";
import TradeChart from "@/components/TradeChart";
import TradeTable from "@/components/TradeTable";
import TradeDetailModal from "@/components/TradeDetailModal";
import ConnectionStatus from "@/components/ConnectionStatus";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut, Plus, BarChart3 } from "lucide-react";
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
    return <LedgerLoading />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="font-display italic text-2xl text-foreground">Ledger</span>
              <span className="h-4 w-px bg-border hidden sm:block" />
              <ConnectionStatus lastSyncTime={lastSyncTime} isSyncing={isSyncing} />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleSync} disabled={isSyncing} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing…" : "Sync MT5"}
              </Button>

              <Button variant="outline" size="sm" onClick={() => router.push("/analytics")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-10">
        <div className="animate-fade-in">
          <StatsCards stats={stats} />
        </div>

        <div className="animate-fade-in-delay-1">
          <SectionHeader
            eyebrow="Performance"
            title="Equity curve"
            subtitle="Cumulative P&L over time"
          />
          <div className="border border-border rounded-sm p-6 bg-card">
            <TradeChart trades={trades} />
          </div>
        </div>

        <div className="animate-fade-in-delay-2">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <SectionHeader
              eyebrow="Record"
              title="Trade history"
              subtitle="The complete journal — notes, mistakes, and analysis"
            />
            <Button size="sm" className="mb-1">
              <Plus className="h-4 w-4 mr-2" />
              New trade
            </Button>
          </div>
          <div className="border border-border rounded-sm bg-card p-6">
            <TradeTable
              trades={trades}
              onTradeClick={(trade) => {
                setSelectedTrade(trade);
                setIsModalOpen(true);
              }}
            />
          </div>
        </div>
      </main>

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

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <p className="font-mono text-xs text-primary mb-1">{eyebrow}</p>
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

function LedgerLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-baseline justify-between mb-6">
          <span className="font-display italic text-xl text-foreground">Ledger</span>
          <span className="font-mono text-xs text-muted-foreground">opening…</span>
        </div>
        <svg viewBox="0 0 300 90" className="w-full h-auto mb-6" fill="none">
          <path
            d="M0,70 L25,65 L50,72 L75,55 L100,60 L125,35 L150,45 L175,20 L200,30 L225,12 L250,22 L275,5 L300,15"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1000"
            strokeDasharray="1000"
            className="animate-draw-line"
          />
        </svg>
        <div className="space-y-2">
          {[100, 88, 72].map((w, i) => (
            <div key={i} className="h-2 rounded-sm bg-border overflow-hidden">
              <div
                className="h-full bg-primary/50 animate-pulse"
                style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
