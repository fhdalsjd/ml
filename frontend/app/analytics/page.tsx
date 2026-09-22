"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  Target,
  Award,
  Activity
} from "lucide-react";
import PerformanceCalendar from "@/components/PerformanceCalendar";
import AdvancedStatsGrid from "@/components/AdvancedStatsGrid";
import StrategyBreakdown from "@/components/StrategyBreakdown";
import EmotionAnalysis from "@/components/EmotionAnalysis";

interface Trade {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  entryDate: string;
  exitDate: string | null;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  pnl: number | null;
  status: "OPEN" | "CLOSED";
  strategy?: string;
  emotions?: string;
  emotionTags?: string[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<any>(null);
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
      console.error("Failed to fetch analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <BarChart3 className="h-8 w-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-slate-300 font-medium">Loading Analytics...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Advanced Stats Overview */}
        <div className="animate-fade-in">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              Advanced Metrics
            </h2>
            <p className="text-sm text-slate-400 mt-1">Comprehensive performance indicators</p>
          </div>
          <AdvancedStatsGrid trades={trades} stats={stats} />
        </div>

        {/* Performance Calendar */}
        <div className="animate-fade-in-delay-1">
          <GlassCard glow="indigo">
            <div className="p-6 border-b border-slate-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-indigo-400" />
                    Trading Calendar
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">Daily P&L heatmap visualization</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <PerformanceCalendar trades={trades} />
            </div>
          </GlassCard>
        </div>

        {/* Two-Column Layout for Strategy & Emotions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-delay-2">
          {/* Strategy Breakdown */}
          <GlassCard glow="emerald">
            <div className="p-6 border-b border-slate-800/50">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-emerald-400" />
                  Strategy Analysis
                </h2>
                <p className="text-sm text-slate-400 mt-1">Performance by trading strategy</p>
              </div>
            </div>
            <div className="p-6">
              <StrategyBreakdown trades={trades} />
            </div>
          </GlassCard>

          {/* Emotion Analysis */}
          <GlassCard glow="purple">
            <div className="p-6 border-b border-slate-800/50">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  Emotion Patterns
                </h2>
                <p className="text-sm text-slate-400 mt-1">Psychology impact on performance</p>
              </div>
            </div>
            <div className="p-6">
              <EmotionAnalysis trades={trades} />
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
