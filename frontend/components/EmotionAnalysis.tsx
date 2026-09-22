"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Trade {
  id: string;
  pnl: number | null;
  status: "OPEN" | "CLOSED";
  emotionTags?: string[];
}

interface EmotionAnalysisProps {
  trades: Trade[];
}

const EMOTION_COLORS: Record<string, string> = {
  confident: "#3FA972",
  calm: "#C99A46",
  anxious: "#f59e0b",
  fearful: "#D1554A",
  greedy: "#fb923c",
  regretful: "#a855f7",
  disciplined: "#06b6d4",
  impulsive: "#ec4899",
  patient: "#6366f1",
  frustrated: "#6b7280",
};

export default function EmotionAnalysis({ trades }: EmotionAnalysisProps) {
  const emotionData = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === "CLOSED" && t.pnl !== null);
    
    if (closedTrades.length === 0) return [];
    
    const emotionMap: Record<string, { pnl: number; count: number; wins: number; losses: number }> = {};
    
    closedTrades.forEach(trade => {
      const emotions = trade.emotionTags || [];
      
      if (emotions.length === 0) {
        emotions.push("untagged");
      }
      
      emotions.forEach(emotion => {
        if (!emotionMap[emotion]) {
          emotionMap[emotion] = { pnl: 0, count: 0, wins: 0, losses: 0 };
        }
        emotionMap[emotion].pnl += trade.pnl!;
        emotionMap[emotion].count += 1;
        if (trade.pnl! > 0) emotionMap[emotion].wins += 1;
        else if (trade.pnl! < 0) emotionMap[emotion].losses += 1;
      });
    });
    
    return Object.entries(emotionMap)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        ...data,
        winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
        avgPnl: data.count > 0 ? data.pnl / data.count : 0,
      }))
      .sort((a, b) => b.avgPnl - a.avgPnl);
  }, [trades]);

  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}$${Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-gray-900/95 border border-gray-700/50 rounded-sm shadow-none p-4">
          <p className="text-sm font-bold text-gray-200 mb-2">{data.name}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Avg P&L:</span>
              <span className={`text-sm font-bold ${data.avgPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(data.avgPnl)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Total P&L:</span>
              <span className={`text-sm font-semibold ${data.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(data.pnl)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Trades:</span>
              <span className="text-sm font-semibold text-gray-200">{data.count}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Win Rate:</span>
              <span className="text-sm font-semibold text-blue-400">{data.winRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (emotionData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
        <div className="text-6xl mb-4">🧠</div>
        <p className="text-lg font-medium">No emotion data available</p>
        <p className="text-sm text-gray-600 mt-2">Tag your trades with emotions to see patterns</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={emotionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
            <XAxis 
              dataKey="name" 
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.1)" }} />
            <Bar dataKey="avgPnl" radius={[8, 8, 0, 0]}>
              {emotionData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={EMOTION_COLORS[entry.name.toLowerCase()] || "#6b7280"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Emotion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {emotionData.map((emotion) => (
          <div 
            key={emotion.name}
            className="p-4 bg-gray-800/30 rounded-lg border border-gray-800/50 hover:bg-gray-800/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: EMOTION_COLORS[emotion.name.toLowerCase()] || "#6b7280" }}
                />
                <span className="font-semibold text-gray-200">{emotion.name}</span>
              </div>
              <span className={`text-base font-bold ${emotion.avgPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(emotion.avgPnl)}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-gray-500">Trades</span>
                <p className="text-sm font-semibold text-gray-300">{emotion.count}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Win Rate</span>
                <p className={`text-sm font-semibold ${
                  emotion.winRate >= 60 ? "text-green-400" : 
                  emotion.winRate >= 40 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {emotion.winRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Total P&L</span>
                <p className={`text-sm font-semibold ${emotion.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrency(emotion.pnl)}
                </p>
              </div>
            </div>

            {/* Win/Loss Indicator */}
            <div className="mt-3 flex gap-1 h-2 rounded-full overflow-hidden bg-gray-700/30">
              <div 
                className="bg-green-500 transition-all" 
                style={{ width: `${emotion.winRate}%` }}
              />
              <div 
                className="bg-red-500 transition-all" 
                style={{ width: `${100 - emotion.winRate}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Key Insights</h4>
        <div className="space-y-1 text-xs text-gray-300">
          {emotionData.length > 0 && (
            <>
              <p>• Best performing emotion: <span className="font-semibold text-green-400">{emotionData[0].name}</span> ({formatCurrency(emotionData[0].avgPnl)} avg)</p>
              <p>• Worst performing emotion: <span className="font-semibold text-red-400">{emotionData[emotionData.length - 1].name}</span> ({formatCurrency(emotionData[emotionData.length - 1].avgPnl)} avg)</p>
              {emotionData.some(e => e.name.toLowerCase() === "disciplined") && (
                <p>• Keep tracking disciplined trades - they often correlate with better outcomes</p>
              )}
              {emotionData.some(e => ["fearful", "anxious", "impulsive"].includes(e.name.toLowerCase())) && (
                <p>• Consider reducing position size when feeling fearful, anxious, or impulsive</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
