"use client";

import { useMemo } from "react";

interface Trade {
  id: string;
  symbol: string;
  pnl: number | null;
  entryDate: string;
  exitDate: string | null;
  status: "OPEN" | "CLOSED";
}

interface DailyPnLBreakdownProps {
  trades: Trade[];
}

export default function DailyPnLBreakdown({ trades }: DailyPnLBreakdownProps) {
  const dailyBreakdown = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === "CLOSED" && t.exitDate && t.pnl !== null);
    
    const dailyMap: Record<string, { pnl: number; trades: number; winners: number; losers: number }> = {};
    
    closedTrades.forEach(trade => {
      const date = new Date(trade.exitDate!).toISOString().split('T')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = { pnl: 0, trades: 0, winners: 0, losers: 0 };
      }
      dailyMap[date].pnl += trade.pnl!;
      dailyMap[date].trades += 1;
      if (trade.pnl! > 0) dailyMap[date].winners += 1;
      else if (trade.pnl! < 0) dailyMap[date].losers += 1;
    });
    
    return Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        ...data,
        winRate: data.trades > 0 ? (data.winners / data.trades) * 100 : 0,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30); // Last 30 days with trades
  }, [trades]);

  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}$${Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      weekday: "short"
    });
  };

  if (dailyBreakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
        <div className="text-6xl mb-4">📅</div>
        <p className="text-lg font-medium">No daily data available</p>
        <p className="text-sm text-gray-600 mt-2">Complete some trades to see daily breakdown</p>
      </div>
    );
  }

  // Calculate loss days
  const lossDays = dailyBreakdown.filter(d => d.pnl < 0);
  const totalLoss = lossDays.reduce((sum, d) => sum + d.pnl, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
          <div className="text-xs text-red-400 font-medium mb-1">Loss Days</div>
          <div className="text-2xl font-bold text-red-400">{lossDays.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            Out of {dailyBreakdown.length} trading days
          </div>
        </div>
        
        <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
          <div className="text-xs text-red-400 font-medium mb-1">Total Loss (Loss Days)</div>
          <div className="text-2xl font-bold text-red-400">{formatCurrency(totalLoss)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Cumulative from losing days
          </div>
        </div>
        
        <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
          <div className="text-xs text-blue-400 font-medium mb-1">Avg Loss Per Day</div>
          <div className="text-2xl font-bold text-blue-400">
            {lossDays.length > 0 ? formatCurrency(totalLoss / lossDays.length) : "$0.00"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Average when losing
          </div>
        </div>
      </div>

      {/* Daily List */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Daily Breakdown (Last 30 Days)</h4>
        <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {dailyBreakdown.map((day) => (
            <div 
              key={day.date}
              className={`p-4 rounded-lg border transition-all hover:scale-[1.01] ${
                day.pnl >= 0 
                  ? "bg-green-600/5 border-green-600/20 hover:bg-green-600/10" 
                  : "bg-red-600/10 border-red-600/30 hover:bg-red-600/15"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-200">{formatDate(day.date)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {day.trades} trade{day.trades !== 1 ? "s" : ""} • {day.winRate.toFixed(0)}% win rate
                  </div>
                </div>
                <div className={`text-xl font-bold ${day.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrency(day.pnl)}
                </div>
              </div>
              
              <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-gray-800/50">
                <div 
                  className="bg-green-500 transition-all" 
                  style={{ width: `${day.winRate}%` }}
                />
                <div 
                  className="bg-red-500 transition-all" 
                  style={{ width: `${100 - day.winRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </div>
  );
}
