"use client";

import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Award, BarChart3, Percent } from "lucide-react";
import StatCard from "./StatCard";

interface StatsCardsProps {
  stats: {
    totalPnL: number;
    winRate: number;
    totalTrades: number;
    activePositions: number;
    pnlChange?: number;
    winRateChange?: number;
    avgWin?: number;
    avgLoss?: number;
    profitFactor?: number;
    sharpeRatio?: number;
  } | null;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 rounded-xl bg-slate-900/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}$${Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const winLossRatio = stats.avgWin && stats.avgLoss
    ? (stats.avgWin / Math.abs(stats.avgLoss)).toFixed(2)
    : null;

  const primaryStats = [
    {
      label: "Total P&L",
      value: formatCurrency(stats.totalPnL),
      change: stats.pnlChange ? { 
        value: `${stats.pnlChange > 0 ? "+" : ""}${stats.pnlChange.toFixed(1)}%`, 
        positive: stats.pnlChange > 0 
      } : undefined,
      icon: DollarSign,
      glow: stats.totalPnL >= 0 ? "emerald" as const : "rose" as const,
    },
    {
      label: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      change: stats.winRateChange ? { 
        value: `${stats.winRateChange > 0 ? "+" : ""}${stats.winRateChange.toFixed(1)}%`, 
        positive: stats.winRateChange > 0 
      } : undefined,
      icon: Target,
      glow: "indigo" as const,
    },
    {
      label: "Total Trades",
      value: stats.totalTrades.toString(),
      icon: Activity,
      glow: "purple" as const,
    },
    {
      label: "Active Positions",
      value: stats.activePositions.toString(),
      icon: Award,
      glow: "amber" as const,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {primaryStats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
