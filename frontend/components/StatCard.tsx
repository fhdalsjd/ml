import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
  icon: LucideIcon;
  glow?: "indigo" | "emerald" | "rose" | "purple" | "amber" | "none";
}

export default function StatCard({ label, value, change, icon: Icon, glow = "none" }: StatCardProps) {
  return (
    <GlassCard hover glow={glow} className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white tabular-nums">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  change.positive ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {change.positive ? "+" : ""}{change.value}
              </span>
              <span className="text-xs text-slate-500">vs last period</span>
            </div>
          )}
        </div>
        <div className={cn(
          "rounded-lg p-3",
          glow === "emerald" && "bg-emerald-500/10 ring-1 ring-emerald-500/20",
          glow === "rose" && "bg-rose-500/10 ring-1 ring-rose-500/20",
          glow === "indigo" && "bg-indigo-500/10 ring-1 ring-indigo-500/20",
          glow === "purple" && "bg-purple-500/10 ring-1 ring-purple-500/20",
          glow === "amber" && "bg-amber-500/10 ring-1 ring-amber-500/20",
          glow === "none" && "bg-slate-800/50 ring-1 ring-slate-700/50"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            glow === "emerald" && "text-emerald-400",
            glow === "rose" && "text-rose-400",
            glow === "indigo" && "text-indigo-400",
            glow === "purple" && "text-purple-400",
            glow === "amber" && "text-amber-400",
            glow === "none" && "text-slate-400"
          )} />
        </div>
      </div>
    </GlassCard>
  );
}
