"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Trade {
  id: string;
  pnl: number | null;
  status: "OPEN" | "CLOSED";
  strategy?: string;
}

interface StrategyBreakdownProps {
  trades: Trade[];
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export default function StrategyBreakdown({ trades }: StrategyBreakdownProps) {
  const strategyData = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === "CLOSED" && t.pnl !== null);
    
    if (closedTrades.length === 0) return [];
    
    const strategyMap: Record<string, { pnl: number; count: number; wins: number; losses: number }> = {};
    
    closedTrades.forEach(trade => {
      const strategy = trade.strategy || "Untagged";
      if (!strategyMap[strategy]) {
        strategyMap[strategy] = { pnl: 0, count: 0, wins: 0, losses: 0 };
      }
      strategyMap[strategy].pnl += trade.pnl!;
      strategyMap[strategy].count += 1;
      if (trade.pnl! > 0) strategyMap[strategy].wins += 1;
      else if (trade.pnl! < 0) strategyMap[strategy].losses += 1;
    });
    
    return Object.entries(strategyMap)
      .map(([name, data]) => ({
        name,
        ...data,
        winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
        avgPnl: data.count > 0 ? data.pnl / data.count : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const chartData = strategyData.map(s => ({
    name: s.name,
    value: Math.abs(s.pnl),
    pnl: s.pnl,
  }));

  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}$${Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const strategy = strategyData.find(s => s.name === data.name);
      if (!strategy) return null;
      
      return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-4">
          <p className="text-sm font-bold text-gray-200 mb-2">{strategy.name}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Total P&L:</span>
              <span className={`text-sm font-bold ${strategy.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(strategy.pnl)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Trades:</span>
              <span className="text-sm font-semibold text-gray-200">{strategy.count}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Win Rate:</span>
              <span className="text-sm font-semibold text-blue-400">{strategy.winRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Avg P&L:</span>
              <span className={`text-sm font-semibold ${strategy.avgPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(strategy.avgPnl)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (strategyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-lg font-medium">No strategy data available</p>
        <p className="text-sm text-gray-600 mt-2">Tag your trades with strategies to see analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Strategy List */}
      <div className="space-y-3">
        {strategyData.map((strategy, idx) => (
          <div 
            key={strategy.name}
            className="p-4 bg-gray-800/30 rounded-lg border border-gray-800/50 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="font-semibold text-gray-200">{strategy.name}</span>
              </div>
              <span className={`text-lg font-bold ${strategy.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(strategy.pnl)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div>
                <span className="text-xs text-gray-500">Trades</span>
                <p className="text-sm font-semibold text-gray-300">{strategy.count}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Win Rate</span>
                <p className="text-sm font-semibold text-blue-400">{strategy.winRate.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Wins/Losses</span>
                <p className="text-sm font-semibold text-gray-300">
                  <span className="text-green-400">{strategy.wins}</span>
                  {" / "}
                  <span className="text-red-400">{strategy.losses}</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Avg P&L</span>
                <p className={`text-sm font-semibold ${strategy.avgPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrency(strategy.avgPnl)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
