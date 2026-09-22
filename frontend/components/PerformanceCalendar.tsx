"use client";

import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addDays, subMonths } from "date-fns";

interface Trade {
  id: string;
  pnl: number | null;
  exitDate: string | null;
  status: "OPEN" | "CLOSED";
}

interface PerformanceCalendarProps {
  trades: Trade[];
}

export default function PerformanceCalendar({ trades }: PerformanceCalendarProps) {
  const calendarData = useMemo(() => {
    const now = new Date();
    const months = [
      { date: now, label: format(now, "MMMM yyyy") },
      { date: subMonths(now, 1), label: format(subMonths(now, 1), "MMMM yyyy") },
      { date: subMonths(now, 2), label: format(subMonths(now, 2), "MMMM yyyy") },
    ];

    return months.map(month => {
      const start = startOfMonth(month.date);
      const end = endOfMonth(month.date);
      const days = eachDayOfInterval({ start, end });
      
      // Add padding days for alignment
      const startDay = getDay(start);
      const paddingStart = Array(startDay).fill(null);
      
      const daysWithPnL = days.map(day => {
        const dayTrades = trades.filter(t => 
          t.status === "CLOSED" && 
          t.exitDate && 
          isSameDay(new Date(t.exitDate), day)
        );
        
        const pnl = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const count = dayTrades.length;
        
        return { date: day, pnl, count };
      });
      
      return {
        label: month.label,
        days: [...paddingStart, ...daysWithPnL],
      };
    });
  }, [trades]);

  const getColorClass = (pnl: number) => {
    if (pnl === 0) return "bg-gray-800/30 border-gray-700/50";
    if (pnl > 0) {
      if (pnl > 1000) return "bg-green-600 border-green-500";
      if (pnl > 500) return "bg-green-500 border-green-400";
      if (pnl > 100) return "bg-green-400/70 border-green-400/50";
      return "bg-green-400/40 border-green-400/30";
    } else {
      if (pnl < -1000) return "bg-red-600 border-red-500";
      if (pnl < -500) return "bg-red-500 border-red-400";
      if (pnl < -100) return "bg-red-400/70 border-red-400/50";
      return "bg-red-400/40 border-red-400/30";
    }
  };

  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}$${Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-8">
      {calendarData.map((month, idx) => (
        <div key={idx} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-200">{month.label}</h3>
          
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {month.days.map((day, dayIdx) => {
              if (day === null) {
                return <div key={`empty-${dayIdx}`} className="aspect-square" />;
              }
              
              const { date, pnl, count } = day;
              const hasTrades = count > 0;
              
              return (
                <div
                  key={dayIdx}
                  className={`
                    aspect-square rounded-lg border-2 transition-all cursor-pointer
                    hover:scale-110 hover:z-10 hover:shadow-xl
                    flex flex-col items-center justify-center
                    ${hasTrades ? getColorClass(pnl) : "bg-gray-800/20 border-gray-800/30"}
                    group relative
                  `}
                >
                  <span className={`text-xs font-semibold ${hasTrades ? "text-white" : "text-gray-600"}`}>
                    {format(date, "d")}
                  </span>
                  {hasTrades && (
                    <>
                      <span className={`text-[10px] font-bold mt-0.5 ${pnl >= 0 ? "text-green-100" : "text-red-100"}`}>
                        {count}
                      </span>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        <div className="text-xs text-gray-300 font-medium">
                          {format(date, "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {count} trade{count !== 1 ? "s" : ""}
                        </div>
                        <div className={`text-sm font-bold mt-1 ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {formatCurrency(pnl)}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700" />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-800/50">
        <span className="text-sm text-gray-400 font-medium">Daily P&L:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-400/40 border-2 border-green-400/30" />
          <span className="text-xs text-gray-500">$1-100</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-400/70 border-2 border-green-400/50" />
          <span className="text-xs text-gray-500">$100-500</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500 border-2 border-green-400" />
          <span className="text-xs text-gray-500">$500-1000</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-600 border-2 border-green-500" />
          <span className="text-xs text-gray-500">$1000+</span>
        </div>
        <div className="w-px h-6 bg-gray-700" />
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-400/40 border-2 border-red-400/30" />
          <span className="text-xs text-gray-500">-$1 to -$100</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-400/70 border-2 border-red-400/50" />
          <span className="text-xs text-gray-500">-$100 to -$500</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500 border-2 border-red-400" />
          <span className="text-xs text-gray-500">-$500 to -$1000</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600 border-2 border-red-500" />
          <span className="text-xs text-gray-500">-$1000+</span>
        </div>
      </div>
    </div>
  );
}
