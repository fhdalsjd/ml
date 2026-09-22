import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "indigo" | "emerald" | "rose" | "purple" | "amber" | "none";
}

export default function GlassCard({ 
  children, 
  className, 
  hover = false,
  glow = "none"
}: GlassCardProps) {
  const glowColors = {
    indigo: "shadow-indigo-500/10 ring-indigo-500/20",
    emerald: "shadow-emerald-500/10 ring-emerald-500/20",
    rose: "shadow-rose-500/10 ring-rose-500/20",
    purple: "shadow-purple-500/10 ring-purple-500/20",
    amber: "shadow-amber-500/10 ring-amber-500/20",
    none: "shadow-slate-900/50 ring-slate-800/50"
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl shadow-2xl ring-1 transition-all duration-300",
        glowColors[glow],
        hover && "hover:shadow-2xl hover:ring-2 hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}
