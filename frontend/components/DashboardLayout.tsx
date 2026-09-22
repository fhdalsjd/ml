"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import ConnectionStatus from "./ConnectionStatus";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Don't apply dashboard layout to auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      
      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {pathname === "/dashboard" && "Dashboard"}
                  {pathname === "/analytics" && "Analytics"}
                  {pathname === "/journal" && "Trade Journal"}
                  {pathname === "/connect-mt5" && "MT5 Connection"}
                </h1>
                <p className="text-xs text-slate-400">
                  {pathname === "/dashboard" && "Overview of your trading performance"}
                  {pathname === "/analytics" && "Deep insights and performance metrics"}
                  {pathname === "/journal" && "Review and annotate your trades"}
                  {pathname === "/connect-mt5" && "Connect to MetaTrader 5"}
                </p>
              </div>
            </div>
            <ConnectionStatus />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
