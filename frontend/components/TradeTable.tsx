"use client";

import { useState } from "react";
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
import { ArrowUpDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function TradeTable({ trades, onTradeClick }: TradeTableProps) {
  const [sortField, setSortField] = useState<SortField>("entryDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [symbolFilter, setSymbolFilter] = useState("");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedAndFilteredTrades = [...trades]
    .filter((trade) =>
      symbolFilter ? trade.symbol.toLowerCase().includes(symbolFilter.toLowerCase()) : true
    )
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
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trade History</CardTitle>
          <input
            type="text"
            placeholder="Filter by symbol..."
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="symbol" label="Symbol" />
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>
                <SortButton field="entryDate" label="Entry Date" />
              </TableHead>
              <TableHead>Exit Date</TableHead>
              <TableHead>Entry Price</TableHead>
              <TableHead>Exit Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>
                <SortButton field="pnl" label="P&L" />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No trades found
                </TableCell>
              </TableRow>
            ) : (
              sortedAndFilteredTrades.map((trade) => (
                <TableRow key={trade.id} className="cursor-pointer">
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={trade.type === "LONG" ? "default" : "secondary"}>
                      {trade.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(trade.entryDate)}</TableCell>
                  <TableCell>{formatDate(trade.exitDate)}</TableCell>
                  <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>{trade.quantity}</TableCell>
                  <TableCell>
                    <span
                      className={
                        trade.pnl === null
                          ? "text-muted-foreground"
                          : trade.pnl >= 0
                          ? "text-green-500 font-medium"
                          : "text-red-500 font-medium"
                      }
                    >
                      {formatCurrency(trade.pnl)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.status === "OPEN" ? "outline" : "success"}>
                      {trade.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTradeClick(trade)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
