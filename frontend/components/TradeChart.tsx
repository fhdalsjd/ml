"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { Trade } from "./TradeTable";

interface TradeChartProps {
  trades: Trade[];
}

export default function TradeChart({ trades }: TradeChartProps) {
  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // Sort trades by entry date
    const sortedTrades = [...trades]
      .filter(t => t.entryDate)
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

    let cumulative = 0;
    const data: Array<{ date: string; pnl: number; cumulative: number }> = [];

    sortedTrades.forEach(trade => {
      if (trade.pnl !== null && trade.exitDate) {
        cumulative += trade.pnl;
        data.push({
          date: trade.exitDate,
          pnl: trade.pnl,
          cumulative: cumulative,
        });
      }
    });

    return data;
  }, [trades]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.cumulative >= 0;
      
      return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-4">
          <p className="text-sm text-gray-400 mb-2 font-medium">
            {formatDate(data.date)}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Cumulative P&L:</span>
              <span className={`text-base font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(data.cumulative)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Trade P&L:</span>
              <span className={`text-sm font-semibold ${data.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(data.pnl)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-gray-500">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-lg font-medium">No trade data available</p>
        <p className="text-sm text-gray-600 mt-2">Complete some trades to see your performance curve</p>
      </div>
    );
  }

  const finalPnL = chartData[chartData.length - 1]?.cumulative || 0;
  const isPositiveOverall = finalPnL >= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isPositiveOverall ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
          <span className="text-sm text-gray-400">
            Current Position: 
            <span className={`ml-2 font-bold ${isPositiveOverall ? "text-green-400" : "text-red-400"}`}>
              {formatCurrency(finalPnL)}
            </span>
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {chartData.length} closed trade{chartData.length !== 1 ? "s" : ""}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPnlPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPnlNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#374151" 
            opacity={0.2}
            vertical={false}
          />
          
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
          />
          
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
            width={80}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "5 5" }} />
          
          {/* Zero line reference */}
          <ReferenceLine 
            y={0} 
            stroke="#6b7280" 
            strokeDasharray="3 3" 
            strokeWidth={2}
            label={{ 
              value: "Break Even", 
              position: "insideTopRight", 
              fill: "#9ca3af",
              fontSize: 11
            }}
          />
          
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={isPositiveOverall ? "#10b981" : "#ef4444"}
            strokeWidth={3}
            fill={isPositiveOverall ? "url(#colorPnlPositive)" : "url(#colorPnlNegative)"}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
