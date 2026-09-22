"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            <BarChart3 className="h-8 w-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-gray-300 font-medium">Loading Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/10 to-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-800/50 shadow-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Performance Analytics
                </h1>
                <p className="text-sm text-gray-400">Deep insights into your trading performance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Advanced Stats Overview */}
        <div className="animate-fade-in">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Advanced Metrics
            </h2>
            <p className="text-sm text-gray-400 mt-1">Comprehensive performance indicators</p>
          </div>
          <AdvancedStatsGrid trades={trades} stats={stats} />
        </div>

        {/* Performance Calendar */}
        <div className="animate-fade-in-delay-1">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-blue-600/10 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-400" />
                    Trading Calendar
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Daily P&L heatmap visualization</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <PerformanceCalendar trades={trades} />
            </div>
          </div>
        </div>

        {/* Two-Column Layout for Strategy & Emotions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-delay-2">
          {/* Strategy Breakdown */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-green-600/10 to-transparent">
              <div>
                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-400" />
                  Strategy Analysis
                </h2>
                <p className="text-sm text-gray-400 mt-1">Performance by trading strategy</p>
              </div>
            </div>
            <div className="p-6">
              <StrategyBreakdown trades={trades} />
            </div>
          </div>

          {/* Emotion Analysis */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-purple-600/10 to-transparent">
              <div>
                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  Emotion Patterns
                </h2>
                <p className="text-sm text-gray-400 mt-1">Psychology impact on performance</p>
              </div>
            </div>
            <div className="p-6">
              <EmotionAnalysis trades={trades} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
