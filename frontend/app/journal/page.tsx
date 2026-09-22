"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import TradeTable from "@/components/TradeTable";
import TradeDetailModal from "@/components/TradeDetailModal";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Filter } from "lucide-react";
import { Trade } from "@/components/TradeTable";

export default function JournalPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchTrades();
  }, [token]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/trades`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTrades(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch trades:", err);
    } finally {
      setLoading(false);
    }
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
        await fetchTrades();
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <BookOpen className="h-8 w-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-slate-300 font-medium">Loading Journal...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-400" />
              Trade Journal
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Review and annotate your trading history
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              New Trade
            </Button>
          </div>
        </div>

        {/* Trade Table */}
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
