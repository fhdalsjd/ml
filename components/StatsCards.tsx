"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const getTrendColor = () => {
    if (trend === "up") return "text-green-400";
    if (trend === "down") return "text-red-400";
    return "text-gray-400";
  };

  const getTrendBg = () => {
    if (trend === "up") return "bg-green-600/10";
    if (trend === "down") return "bg-red-600/10";
    return "bg-gray-600/10";
  };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-3 w-3" />;
    if (trend === "down") return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border-gray-800/50 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">
          {title}
        </CardTitle>
        <div className={`h-10 w-10 rounded-full ${getTrendBg()} flex items-center justify-center`}>
          <div className={getTrendColor()}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-br from-gray-100 to-gray-300 bg-clip-text text-transparent">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()} mt-2 font-medium`}>
            {getTrendIcon()}
            <span>{change > 0 ? "+" : ""}{change.toFixed(1)}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
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
          <Card key={i} className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border-gray-800/50 animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-gray-800 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-gray-800 rounded" />
            </CardContent>
          </Card>
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

  const getWinRateColor = () => {
    if (stats.winRate >= 60) return "up";
    if (stats.winRate < 40) return "down";
    return "neutral";
  };

  // Calculate win/loss ratio for display
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
        title="Win Rate"
        value={`${stats.winRate.toFixed(1)}%`}
        change={stats.winRateChange}
        icon={<Target className="h-5 w-5" />}
        trend={getWinRateTrend()}
        subtitle={winLossRatio ? `W/L Ratio: ${winLossRatio}` : undefined}
      />
      
      <StatCard
        title="Total Trades"
        value={stats.totalTrades}
        icon={<Activity className="h-5 w-5" />}
        subtitle="Executed positions"
      />
      
      <StatCard
        title="Active Positions"
        value={stats.activePositions}
        icon={<Award className="h-5 w-5" />}
        trend={stats.activePositions > 0 ? "neutral" : "neutral"}
        subtitle="Currently open"
      />

      {/* Additional metrics if available */}
      {stats.avgWin !== undefined && (
        <StatCard
          title="Avg Win"
          value={formatCurrency(stats.avgWin)}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
          subtitle="Per winning trade"
        />
      )}

      {stats.avgLoss !== undefined && (
        <StatCard
          title="Avg Loss"
          value={formatCurrency(stats.avgLoss)}
          icon={<TrendingDown className="h-5 w-5" />}
          trend="down"
          subtitle="Per losing trade"
        />
      )}

      {stats.profitFactor !== undefined && (
        <StatCard
          title="Profit Factor"
          value={stats.profitFactor.toFixed(2)}
          icon={<BarChart3 className="h-5 w-5" />}
          trend={stats.profitFactor > 1.5 ? "up" : stats.profitFactor < 1 ? "down" : "neutral"}
          subtitle="Gross profit / Gross loss"
        />
      )}

      {stats.sharpeRatio !== undefined && (
        <StatCard
          title="Sharpe Ratio"
          value={stats.sharpeRatio.toFixed(2)}
          icon={<Percent className="h-5 w-5" />}
          trend={stats.sharpeRatio > 1 ? "up" : stats.sharpeRatio < 0 ? "down" : "neutral"}
          subtitle="Risk-adjusted return"
        />
      )}
    </div>
  );
}
