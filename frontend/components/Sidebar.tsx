"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BarChart3, 
  BookOpen, 
  Settings, 
  LogOut,
  TrendingUp,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Journal", href: "/journal", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800/50 bg-slate-950/95 backdrop-blur-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800/50 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-white">Ledger</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`
                  group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-white shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/20" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }
                `}
              >
                <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-3 space-y-1">
          <button
            onClick={() => router.push("/connect-mt5")}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800/50 hover:text-slate-200"
          >
            <Zap className="h-5 w-5 text-slate-500 group-hover:text-slate-300" />
            <span>Connect MT5</span>
          </button>
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-300 hover:ring-1 hover:ring-rose-500/20"
          >
            <LogOut className="h-5 w-5 text-slate-500 group-hover:text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
