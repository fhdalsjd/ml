"use client";

import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Award, BarChart3, Percent } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
}

function StatCard({ title, value, change, icon, trend = "neutral", subtitle }: StatCardProps) {
  const trendColor = trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground";

  return (
    <div className="border border-border rounded-sm bg-card p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={trendColor}>{icon}</div>
      </div>
      <div className="font-mono text-2xl tabular-nums text-foreground">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs ${trendColor} mt-3 font-mono tabular-nums`}>
          {trend === "up" && <TrendingUp className="h-3 w-3" />}
          {trend === "down" && <TrendingDown className="h-3 w-3" />}
          <span>{change > 0 ? "+" : ""}{change.toFixed(1)}% from last period</span>
        </div>
      )}
    </div>
  );
}

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="border border-border rounded-sm bg-card p-5 animate-pulse">
            <div className="h-4 w-24 bg-border rounded-sm mb-4" />
            <div className="h-7 w-32 bg-border rounded-sm" />
          </div>
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

  const getPnLTrend = (): "up" | "down" | "neutral" => {
    if (stats.pnlChange === undefined) return "neutral";
    return stats.pnlChange > 0 ? "up" : stats.pnlChange < 0 ? "down" : "neutral";
  };

  const getWinRateTrend = (): "up" | "down" | "neutral" => {
    if (stats.winRateChange === undefined) return "neutral";
    return stats.winRateChange > 0 ? "up" : stats.winRateChange < 0 ? "down" : "neutral";
  };

  const winLossRatio = stats.avgWin && stats.avgLoss
    ? (stats.avgWin / Math.abs(stats.avgLoss)).toFixed(2)
    : null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      <StatCard
        title="Total P&L"
        value={formatCurrency(stats.totalPnL)}
        change={stats.pnlChange}
        icon={<DollarSign className="h-5 w-5" />}
        trend={getPnLTrend()}
        subtitle="All-time performance"
      />

      <StatCard
        title="Win rate"
        value={`${stats.winRate.toFixed(1)}%`}
        change={stats.winRateChange}
        icon={<Target className="h-5 w-5" />}
        trend={getWinRateTrend()}
        subtitle={winLossRatio ? `W/L ratio: ${winLossRatio}` : undefined}
      />

      <StatCard
        title="Total trades"
        value={stats.totalTrades}
        icon={<Activity className="h-5 w-5" />}
        subtitle="Executed positions"
      />

      <StatCard
        title="Active positions"
        value={stats.activePositions}
        icon={<Award className="h-5 w-5" />}
        subtitle="Currently open"
      />

      {stats.avgWin !== undefined && (
        <StatCard
          title="Avg win"
          value={formatCurrency(stats.avgWin)}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
          subtitle="Per winning trade"
        />
      )}

      {stats.avgLoss !== undefined && (
        <StatCard
          title="Avg loss"
          value={formatCurrency(stats.avgLoss)}
          icon={<TrendingDown className="h-5 w-5" />}
          trend="down"
          subtitle="Per losing trade"
        />
      )}

      {stats.profitFactor !== undefined && (
        <StatCard
          title="Profit factor"
          value={stats.profitFactor.toFixed(2)}
          icon={<BarChart3 className="h-5 w-5" />}
          trend={stats.profitFactor > 1.5 ? "up" : stats.profitFactor < 1 ? "down" : "neutral"}
          subtitle="Gross profit / gross loss"
        />
      )}

      {stats.sharpeRatio !== undefined && (
        <StatCard
          title="Sharpe ratio"
          value={stats.sharpeRatio.toFixed(2)}
          icon={<Percent className="h-5 w-5" />}
          trend={stats.sharpeRatio > 1 ? "up" : stats.sharpeRatio < 0 ? "down" : "neutral"}
          subtitle="Risk-adjusted return"
        />
      )}
    </div>
  );
}
