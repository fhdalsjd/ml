"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trade } from "./TradeTable";

interface TradeDetailModalProps {
  trade: Trade | null;
  open: boolean;
  onClose: () => void;
  onSave: (tradeId: string, notes: { emotions: string; mistakes: string; strategy: string }) => void;
}

export default function TradeDetailModal({ trade, open, onClose, onSave }: TradeDetailModalProps) {
  const [emotions, setEmotions] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [strategy, setStrategy] = useState("");

  if (!trade) return null;

  const handleSave = () => {
    onSave(trade.id, { emotions, mistakes, strategy });
    setEmotions("");
    setMistakes("");
    setStrategy("");
    onClose();
  };

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
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateReturnPercentage = () => {
    if (!trade.exitPrice) return null;
    const change = trade.type === "LONG"
      ? ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100
      : ((trade.entryPrice - trade.exitPrice) / trade.entryPrice) * 100;
    return change.toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl font-bold">{trade.symbol}</span>
            <Badge variant={trade.type === "LONG" ? "default" : "secondary"}>
              {trade.type}
            </Badge>
            <Badge variant={trade.status === "OPEN" ? "outline" : "success"}>
              {trade.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review and add notes about this trade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trade Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-accent/20 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Entry Date</p>
              <p className="font-medium">{formatDate(trade.entryDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exit Date</p>
              <p className="font-medium">{formatDate(trade.exitDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entry Price</p>
              <p className="font-medium">${trade.entryPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exit Price</p>
              <p className="font-medium">
                {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">{trade.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission</p>
              <p className="font-medium">
                {trade.commission ? `$${trade.commission.toFixed(2)}` : "$0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Return %</p>
              <p className={`font-medium ${
                calculateReturnPercentage() === null
                  ? "text-muted-foreground"
                  : parseFloat(calculateReturnPercentage()!) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}>
                {calculateReturnPercentage() !== null ? `${calculateReturnPercentage()}%` : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">P&L</p>
              <p className={`text-lg font-bold ${
                trade.pnl === null
                  ? "text-muted-foreground"
                  : trade.pnl >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}>
                {formatCurrency(trade.pnl)}
              </p>
            </div>
          </div>

          {/* Trade Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emotions">Emotions & Psychology</Label>
              <Textarea
                id="emotions"
                placeholder="How did you feel during this trade? Were you calm, anxious, overconfident?"
                value={emotions}
                onChange={(e) => setEmotions(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mistakes">Mistakes & Lessons</Label>
              <Textarea
                id="mistakes"
                placeholder="What mistakes did you make? What would you do differently?"
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy & Execution</Label>
              <Textarea
                id="strategy"
                placeholder="What was your strategy? Did you follow your plan? Entry/exit rationale?"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
