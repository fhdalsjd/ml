"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  Percent,
  DollarSign,
  BarChart3,
  Activity,
  Calendar,
  AlertCircle
} from "lucide-react";

interface Trade {
  id: string;
  pnl: number | null;
  entryDate: string;
  exitDate: string | null;
  status: "OPEN" | "CLOSED";
}

interface AdvancedStatsGridProps {
  trades: Trade[];
  stats: any;
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  className = ""
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-400 bg-green-600/10";
    if (trend === "down") return "text-red-400 bg-red-600/10";
    return "text-blue-400 bg-blue-600/10";
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border-gray-800/50 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">
          {title}
        </CardTitle>
        <div className={`h-10 w-10 rounded-full ${getTrendColor()} flex items-center justify-center`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl lg:text-3xl font-bold bg-gradient-to-br from-gray-100 to-gray-300 bg-clip-text text-transparent ${className}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdvancedStatsGrid({ trades, stats }: AdvancedStatsGridProps) {
  const advancedMetrics = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === "CLOSED" && t.pnl !== null);
    
    if (closedTrades.length === 0) {
      return {
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        winStreak: 0,
        lossStreak: 0,
        profitFactor: 0,
        expectancy: 0,
        sharpeRatio: 0,
        avgHoldTime: 0,
        avgTradesPerDay: 0,
        recoveryFactor: 0,
        maxDrawdown: 0,
        maxDrawdownDate: null,
      };
    }

    const wins = closedTrades.filter(t => t.pnl! > 0);
    const losses = closedTrades.filter(t => t.pnl! < 0);
    
    const totalWinAmount = wins.reduce((sum, t) => sum + t.pnl!, 0);
    const totalLossAmount = Math.abs(losses.reduce((sum, t) => sum + t.pnl!, 0));
    
    const avgWin = wins.length > 0 ? totalWinAmount / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLossAmount / losses.length : 0;
    
    const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.pnl!)) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.pnl!)) : 0;
    
    // Calculate streaks
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let streakType: "win" | "loss" | null = null;
    
    closedTrades
      .sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime())
      .forEach(trade => {
        const isWin = trade.pnl! > 0;
        if (streakType === null) {
          streakType = isWin ? "win" : "loss";
          currentStreak = 1;
        } else if ((isWin && streakType === "win") || (!isWin && streakType === "loss")) {
          currentStreak++;
        } else {
          if (streakType === "win") maxWinStreak = Math.max(maxWinStreak, currentStreak);
          if (streakType === "loss") maxLossStreak = Math.max(maxLossStreak, currentStreak);
          streakType = isWin ? "win" : "loss";
          currentStreak = 1;
        }
      });
    
    if (streakType === "win") maxWinStreak = Math.max(maxWinStreak, currentStreak);
    if (streakType === "loss") maxLossStreak = Math.max(maxLossStreak, currentStreak);
    
    // Profit Factor
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 999 : 0;
    
    // Expectancy
    const winRate = wins.length / closedTrades.length;
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);
    
    // Calculate drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownDate = null;
    let cumulative = 0;
    
    closedTrades
      .sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime())
      .forEach(trade => {
        cumulative += trade.pnl!;
        if (cumulative > peak) {
          peak = cumulative;
        }
        const drawdown = peak - cumulative;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
          maxDrawdownDate = trade.exitDate;
        }
      });
    
    // Recovery Factor
    const recoveryFactor = maxDrawdown > 0 ? (stats?.totalPnL || 0) / maxDrawdown : 0;
    
    // Avg hold time
    const holdTimes = closedTrades
      .filter(t => t.exitDate)
      .map(t => {
        const entry = new Date(t.entryDate).getTime();
        const exit = new Date(t.exitDate!).getTime();
        return (exit - entry) / (1000 * 60 * 60); // hours
      });
    const avgHoldTime = holdTimes.length > 0 ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length : 0;
    
    // Trades per day
    if (closedTrades.length > 1) {
      const sortedByDate = [...closedTrades].sort((a, b) => 
        new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime()
      );
      const firstDate = new Date(sortedByDate[0].exitDate!).getTime();
      const lastDate = new Date(sortedByDate[sortedByDate.length - 1].exitDate!).getTime();
      const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
      var avgTradesPerDay = daysDiff > 0 ? closedTrades.length / daysDiff : 0;
    } else {
      var avgTradesPerDay = 0;
    }
    
    // Sharpe Ratio (simplified)
    const returns = closedTrades.map(t => t.pnl!);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized
    
    return {
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      winStreak: maxWinStreak,
      lossStreak: maxLossStreak,
      profitFactor,
      expectancy,
      sharpeRatio,
      avgHoldTime,
      avgTradesPerDay,
      recoveryFactor,
      maxDrawdown,
      maxDrawdownDate,
    };
  }, [trades, stats]);

  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}$${Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <StatCard
        title="Avg Win"
        value={formatCurrency(advancedMetrics.avgWin)}
        icon={<TrendingUp className="h-5 w-5" />}
        trend="up"
        subtitle="Per winning trade"
      />
      
      <StatCard
        title="Avg Loss"
        value={formatCurrency(-advancedMetrics.avgLoss)}
        icon={<TrendingDown className="h-5 w-5" />}
        trend="down"
        subtitle="Per losing trade"
      />
      
      <StatCard
        title="Profit Factor"
        value={advancedMetrics.profitFactor.toFixed(2)}
        icon={<BarChart3 className="h-5 w-5" />}
        trend={advancedMetrics.profitFactor > 1.5 ? "up" : advancedMetrics.profitFactor < 1 ? "down" : "neutral"}
        subtitle="Gross profit / loss"
      />
      
      <StatCard
        title="Expectancy"
        value={formatCurrency(advancedMetrics.expectancy)}
        icon={<Target className="h-5 w-5" />}
        trend={advancedMetrics.expectancy > 0 ? "up" : "down"}
        subtitle="Expected per trade"
      />
      
      <StatCard
        title="Largest Win"
        value={formatCurrency(advancedMetrics.largestWin)}
        icon={<Award className="h-5 w-5" />}
        trend="up"
        subtitle="Best single trade"
      />
      
      <StatCard
        title="Largest Loss"
        value={formatCurrency(advancedMetrics.largestLoss)}
        icon={<AlertCircle className="h-5 w-5" />}
        trend="down"
        subtitle="Worst single trade"
      />
      
      <StatCard
        title="Win Streak"
        value={advancedMetrics.winStreak}
        icon={<Activity className="h-5 w-5" />}
        trend="up"
        subtitle="Consecutive wins"
      />
      
      <StatCard
        title="Loss Streak"
        value={advancedMetrics.lossStreak}
        icon={<Activity className="h-5 w-5" />}
        trend="down"
        subtitle="Consecutive losses"
      />
      
      <StatCard
        title="Sharpe Ratio"
        value={advancedMetrics.sharpeRatio.toFixed(2)}
        icon={<Percent className="h-5 w-5" />}
        trend={advancedMetrics.sharpeRatio > 1 ? "up" : "down"}
        subtitle="Risk-adjusted return"
      />
      
      <StatCard
        title="Avg Hold Time"
        value={formatTime(advancedMetrics.avgHoldTime)}
        icon={<Calendar className="h-5 w-5" />}
        trend="neutral"
        subtitle="Position duration"
      />
      
      <StatCard
        title="Max Drawdown"
        value={formatCurrency(-advancedMetrics.maxDrawdown)}
        icon={<TrendingDown className="h-5 w-5" />}
        trend="down"
        subtitle="Peak to trough"
      />
      
      <StatCard
        title="Recovery Factor"
        value={advancedMetrics.recoveryFactor.toFixed(2)}
        icon={<Activity className="h-5 w-5" />}
        trend={advancedMetrics.recoveryFactor > 2 ? "up" : "neutral"}
        subtitle="Net profit / drawdown"
      />
    </div>
  );
}
