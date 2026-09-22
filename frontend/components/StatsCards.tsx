"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Award } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

function StatCard({ title, value, change, icon, trend = "neutral" }: StatCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-500";
    if (trend === "down") return "text-red-500";
    return "text-muted-foreground";
  };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-4 w-4" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()} mt-1`}>
            {getTrendIcon()}
            <span>{change > 0 ? "+" : ""}{change}% from last period</span>
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
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total P&L"
        value={formatCurrency(stats.totalPnL)}
        change={stats.pnlChange}
        icon={<DollarSign className="h-4 w-4" />}
        trend={getPnLTrend()}
      />
      <StatCard
        title="Win Rate"
        value={`${stats.winRate.toFixed(1)}%`}
        change={stats.winRateChange}
        icon={<Target className="h-4 w-4" />}
        trend={getWinRateTrend()}
      />
      <StatCard
        title="Total Trades"
        value={stats.totalTrades}
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Active Positions"
        value={stats.activePositions}
        icon={<Award className="h-4 w-4" />}
      />
    </div>
  );
}
