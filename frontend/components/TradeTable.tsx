"use client";

import { useState, useMemo } from "react";
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
        if (symbolFilter && !trade.symbol.toLowerCase().includes(symbolFilter.toLowerCase())) {
          return false;
        }
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
      className="flex items-center gap-1 hover:text-primary transition-colors group"
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 transition-all ${sortField === field ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
    </button>
  );

  const FilterButton = ({ status, label }: { status: StatusFilter; label: string }) => (
    <button
      onClick={() => setStatusFilter(status)}
      className={`px-3 py-1.5 text-xs font-mono rounded-sm border transition-colors ${
        statusFilter === status
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground"
      }`}
    >
      {label}
    </button>
  );

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
          <Filter className="h-4 w-4 text-muted-foreground" />
          <FilterButton status="ALL" label="All" />
          <FilterButton status="OPEN" label="Open" />
          <FilterButton status="CLOSED" label="Closed" />
          <FilterButton status="WINNING" label="Winners" />
          <FilterButton status="LOSING" label="Losers" />
        </div>

        <Input
          type="text"
          placeholder="Filter by symbol…"
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-6 px-4 py-3 border border-border rounded-sm bg-background/40 font-mono text-sm tabular-nums">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Showing</span>
          <span className="text-foreground">{stats.total} trades</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-muted-foreground">Wins</span>
          <span className="text-green-400">{stats.winning}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-red-400" />
          <span className="text-muted-foreground">Losses</span>
          <span className="text-red-400">{stats.losing}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total P&L</span>
          <span className={stats.totalPnL >= 0 ? "text-green-400" : "text-red-400"}>
            {formatCurrency(stats.totalPnL)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-transparent hover:bg-transparent border-border">
                <TableHead><SortButton field="symbol" label="Symbol" /></TableHead>
                <TableHead>Type</TableHead>
                <TableHead><SortButton field="entryDate" label="Entry date" /></TableHead>
                <TableHead>Exit date</TableHead>
                <TableHead className="text-right">Entry price</TableHead>
                <TableHead className="text-right">Exit price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right"><SortButton field="pnl" label="P&L" /></TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-12">
                    <p className="font-medium text-foreground">No trades found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTrades.map((trade) => (
                  <TableRow
                    key={trade.id}
                    className="cursor-pointer hover:bg-accent/50 border-border transition-colors"
                    onClick={() => onTradeClick(trade)}
                  >
                    <TableCell className="font-medium text-foreground">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge
                        className={trade.type === "LONG"
                          ? "bg-green-600/10 text-green-400 border-green-600/30"
                          : "bg-red-600/10 text-red-400 border-red-600/30"}
                      >
                        {trade.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{formatDate(trade.entryDate)}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{formatDate(trade.exitDate)}</TableCell>
                    <TableCell className="text-foreground text-right font-mono text-sm tabular-nums">${trade.entryPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-foreground text-right font-mono text-sm tabular-nums">
                      {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="text-foreground text-right font-mono text-sm tabular-nums">{trade.quantity}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-mono text-sm font-medium tabular-nums ${
                          trade.pnl === null
                            ? "text-muted-foreground"
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
                          ? "border-primary/50 text-primary bg-primary/10"
                          : "bg-secondary text-secondary-foreground border-transparent"}
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
