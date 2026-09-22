"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Eye, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Trade {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  entryDate: string;
  exitDate: string | null;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  pnl: number | null;
  status: "OPEN" | "CLOSED";
  commission?: number;
}

interface TradeTableProps {
  trades: Trade[];
  onTradeClick: (trade: Trade) => void;
}

type SortField = "entryDate" | "symbol" | "pnl";
type SortDirection = "asc" | "desc";
type StatusFilter = "ALL" | "OPEN" | "CLOSED" | "WINNING" | "LOSING";

export default function TradeTable({ trades, onTradeClick }: TradeTableProps) {
  const [sortField, setSortField] = useState<SortField>("entryDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [symbolFilter, setSymbolFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedTrades = useMemo(() => {
    return [...trades]
      .filter((trade) => {
        // Symbol filter
        if (symbolFilter && !trade.symbol.toLowerCase().includes(symbolFilter.toLowerCase())) {
          return false;
        }
        
        // Status filter
        if (statusFilter === "OPEN" && trade.status !== "OPEN") return false;
        if (statusFilter === "CLOSED" && trade.status !== "CLOSED") return false;
        if (statusFilter === "WINNING" && (trade.pnl === null || trade.pnl <= 0)) return false;
        if (statusFilter === "LOSING" && (trade.pnl === null || trade.pnl >= 0)) return false;
        
        return true;
      })
      .sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case "entryDate":
            aValue = new Date(a.entryDate).getTime();
            bValue = new Date(b.entryDate).getTime();
            break;
          case "symbol":
            aValue = a.symbol;
            bValue = b.symbol;
            break;
          case "pnl":
            aValue = a.pnl || 0;
            bValue = b.pnl || 0;
            break;
        }

        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [trades, symbolFilter, statusFilter, sortField, sortDirection]);

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    const sign = value >= 0 ? "+" : "";
    return `${sign}$${Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-blue-400 transition-colors group"
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 transition-all ${sortField === field ? "text-blue-400" : "text-gray-600 group-hover:text-blue-400"}`} />
    </button>
  );

  const FilterButton = ({ status, label }: { status: StatusFilter; label: string }) => (
    <button
      onClick={() => setStatusFilter(status)}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
        statusFilter === status
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
          : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
      }`}
    >
      {label}
    </button>
  );

  // Calculate stats for current filter
  const stats = useMemo(() => {
    const winning = filteredAndSortedTrades.filter(t => t.pnl !== null && t.pnl > 0).length;
    const losing = filteredAndSortedTrades.filter(t => t.pnl !== null && t.pnl < 0).length;
    const totalPnL = filteredAndSortedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    return { winning, losing, totalPnL, total: filteredAndSortedTrades.length };
  }, [filteredAndSortedTrades]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-400" />
          <FilterButton status="ALL" label="All" />
          <FilterButton status="OPEN" label="Open" />
          <FilterButton status="CLOSED" label="Closed" />
          <FilterButton status="WINNING" label="Winners" />
          <FilterButton status="LOSING" label="Losers" />
        </div>

        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Filter by symbol..."
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="w-48 bg-gray-800/50 border-gray-700 focus:border-blue-500 text-gray-100 placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-6 p-4 bg-gray-800/30 rounded-lg border border-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Showing:</span>
          <span className="text-sm font-semibold text-gray-200">{stats.total} trades</span>
        </div>
        <div className="h-4 w-px bg-gray-700" />
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-sm text-gray-400">Wins:</span>
          <span className="text-sm font-semibold text-green-400">{stats.winning}</span>
        </div>
        <div className="h-4 w-px bg-gray-700" />
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-red-400" />
          <span className="text-sm text-gray-400">Losses:</span>
          <span className="text-sm font-semibold text-red-400">{stats.losing}</span>
        </div>
        <div className="h-4 w-px bg-gray-700" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Total P&L:</span>
          <span className={`text-sm font-bold ${stats.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(stats.totalPnL)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800/50 hover:bg-gray-800/50 border-gray-800/50">
                <TableHead className="text-gray-400 font-semibold">
                  <SortButton field="symbol" label="Symbol" />
                </TableHead>
                <TableHead className="text-gray-400 font-semibold">Type</TableHead>
                <TableHead className="text-gray-400 font-semibold">
                  <SortButton field="entryDate" label="Entry Date" />
                </TableHead>
                <TableHead className="text-gray-400 font-semibold">Exit Date</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Entry Price</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Exit Price</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Qty</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">
                  <SortButton field="pnl" label="P&L" />
                </TableHead>
                <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                <TableHead className="text-gray-400 font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl">📭</div>
                      <p className="font-medium">No trades found</p>
                      <p className="text-sm text-gray-600">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTrades.map((trade) => (
                  <TableRow 
                    key={trade.id} 
                    className="cursor-pointer hover:bg-gray-800/30 border-gray-800/30 transition-colors"
                    onClick={() => onTradeClick(trade)}
                  >
                    <TableCell className="font-semibold text-gray-200">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={trade.type === "LONG" ? "default" : "secondary"}
                        className={trade.type === "LONG"
                          ? "bg-green-600/20 text-green-400 border-green-600/50"
                          : "bg-red-600/20 text-red-400 border-red-600/50"}
                      >
                        {trade.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{formatDate(trade.entryDate)}</TableCell>
                    <TableCell className="text-gray-300">{formatDate(trade.exitDate)}</TableCell>
                    <TableCell className="text-gray-300 text-right font-mono">${trade.entryPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-gray-300 text-right font-mono">
                      {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="text-gray-300 text-right">{trade.quantity}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-bold ${
                          trade.pnl === null
                            ? "text-gray-500"
                            : trade.pnl >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatCurrency(trade.pnl)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={trade.status === "OPEN" ? "outline" : "default"}
                        className={trade.status === "OPEN"
                          ? "border-yellow-600/50 text-yellow-400 bg-yellow-600/10"
                          : "bg-blue-600/20 text-blue-400 border-blue-600/50"}
                      >
                        {trade.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTradeClick(trade);
                        }}
                        className="hover:bg-blue-600/20 hover:text-blue-400"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
