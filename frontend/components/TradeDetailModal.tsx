"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Trade } from "./TradeTable";
import { 
  Smile, 
  Frown, 
  Meh, 
  ThumbsUp, 
  ThumbsDown, 
  Brain,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Upload,
  X,
  Camera,
  FileText
} from "lucide-react";

interface TradeDetailModalProps {
  trade: Trade | null;
  open: boolean;
  onClose: () => void;
  onSave: (tradeId: string, notes: { 
    emotions: string; 
    mistakes: string; 
    strategy: string;
    emotionTags?: string[];
    riskReward?: number;
    screenshots?: string[];
  }) => void;
}

const EMOTION_OPTIONS = [
  { id: "confident", label: "Confident", icon: ThumbsUp, color: "text-green-400 bg-green-400/10 border-green-400/30" },
  { id: "calm", label: "Calm", icon: Smile, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  { id: "anxious", label: "Anxious", icon: AlertTriangle, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  { id: "fearful", label: "Fearful", icon: Frown, color: "text-red-400 bg-red-400/10 border-red-400/30" },
  { id: "greedy", label: "Greedy", icon: TrendingUp, color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  { id: "regretful", label: "Regretful", icon: ThumbsDown, color: "text-purple-400 bg-purple-400/10 border-purple-400/30" },
  { id: "disciplined", label: "Disciplined", icon: Target, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" },
  { id: "impulsive", label: "Impulsive", icon: Zap, color: "text-pink-400 bg-pink-400/10 border-pink-400/30" },
  { id: "patient", label: "Patient", icon: Brain, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30" },
  { id: "frustrated", label: "Frustrated", icon: Meh, color: "text-gray-400 bg-gray-400/10 border-gray-400/30" },
];

export default function TradeDetailModal({ trade, open, onClose, onSave }: TradeDetailModalProps) {
  const [emotions, setEmotions] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [strategy, setStrategy] = useState("");
  const [selectedEmotionTags, setSelectedEmotionTags] = useState<string[]>([]);
  const [riskReward, setRiskReward] = useState<string>("");
  const [screenshots, setScreenshots] = useState<string[]>([]);

  useEffect(() => {
    if (trade) {
      // Reset form when trade changes
      setEmotions("");
      setMistakes("");
      setStrategy("");
      setSelectedEmotionTags([]);
      setRiskReward("");
      setScreenshots([]);
    }
  }, [trade]);

  if (!trade) return null;

  const toggleEmotionTag = (emotionId: string) => {
    setSelectedEmotionTags(prev => 
      prev.includes(emotionId) 
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    );
  };

  const handleSave = () => {
    onSave(trade.id, { 
      emotions, 
      mistakes, 
      strategy,
      emotionTags: selectedEmotionTags,
      riskReward: riskReward ? parseFloat(riskReward) : undefined,
      screenshots
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you would upload these to a server and get URLs
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshots(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
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

  const returnPercent = calculateReturnPercentage();
  const isWinningTrade = returnPercent !== null && parseFloat(returnPercent) > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-900/95 border-gray-800/50 shadow-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {trade.symbol}
            </span>
            <Badge 
              variant={trade.type === "LONG" ? "default" : "secondary"}
              className={trade.type === "LONG" 
                ? "bg-green-600/20 text-green-400 border-green-600/50" 
                : "bg-red-600/20 text-red-400 border-red-600/50"}
            >
              {trade.type}
            </Badge>
            <Badge 
              variant={trade.status === "OPEN" ? "outline" : "default"}
              className={trade.status === "OPEN"
                ? "border-yellow-600/50 text-yellow-400"
                : "bg-blue-600/20 text-blue-400 border-blue-600/50"}
            >
              {trade.status}
            </Badge>
            {isWinningTrade !== null && (
              <Badge className={isWinningTrade 
                ? "bg-green-600/20 text-green-400 border-green-600/50" 
                : "bg-red-600/20 text-red-400 border-red-600/50"
              }>
                {isWinningTrade ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {isWinningTrade ? "Winner" : "Loser"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Analyze and document this trade for future learning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trade Details - Enhanced Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-sm border border-gray-700/50">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Entry Date</p>
              <p className="font-semibold text-gray-200 text-sm">{formatDate(trade.entryDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Exit Date</p>
              <p className="font-semibold text-gray-200 text-sm">{formatDate(trade.exitDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Entry Price</p>
              <p className="font-semibold text-gray-200">${trade.entryPrice.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Exit Price</p>
              <p className="font-semibold text-gray-200">
                {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Quantity</p>
              <p className="font-semibold text-gray-200">{trade.quantity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Commission</p>
              <p className="font-semibold text-gray-200">
                {trade.commission ? `$${trade.commission.toFixed(2)}` : "$0.00"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Return %</p>
              <p className={`font-bold text-lg ${
                returnPercent === null
                  ? "text-gray-400"
                  : parseFloat(returnPercent) >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}>
                {returnPercent !== null ? `${returnPercent}%` : "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">P&L</p>
              <p className={`font-bold text-xl ${
                trade.pnl === null
                  ? "text-gray-400"
                  : trade.pnl >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}>
                {formatCurrency(trade.pnl)}
              </p>
            </div>
          </div>

          {/* Risk/Reward Ratio */}
          <div className="space-y-3">
            <Label htmlFor="riskReward" className="text-base font-semibold text-gray-200 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" />
              Risk/Reward Ratio
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="riskReward"
                type="number"
                step="0.1"
                placeholder="e.g., 2.5 (for 1:2.5)"
                value={riskReward}
                onChange={(e) => setRiskReward(e.target.value)}
                className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-gray-100"
              />
              {riskReward && parseFloat(riskReward) > 0 && (
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/50 whitespace-nowrap">
                  1:{riskReward}
                </Badge>
              )}
            </div>
          </div>

          {/* Emotion Tags Selector */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-200 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              Emotional State During Trade
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {EMOTION_OPTIONS.map(emotion => {
                const Icon = emotion.icon;
                const isSelected = selectedEmotionTags.includes(emotion.id);
                return (
                  <button
                    key={emotion.id}
                    type="button"
                    onClick={() => toggleEmotionTag(emotion.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                      ${isSelected 
                        ? emotion.color + " border-2 " 
                        : "bg-gray-800/30 border-gray-700/50 text-gray-400 hover:bg-gray-800/50"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{emotion.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trade Notes */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="emotions" className="text-base font-semibold text-gray-200 flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-400" />
                Emotions & Psychology Notes
              </Label>
              <Textarea
                id="emotions"
                placeholder="How did you feel during this trade? Were you following your plan? Any emotional triggers?"
                value={emotions}
                onChange={(e) => setEmotions(e.target.value)}
                rows={3}
                className="bg-gray-800/50 border-gray-700 focus:border-purple-500 text-gray-100 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="mistakes" className="text-base font-semibold text-gray-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                Mistakes & Lessons Learned
              </Label>
              <Textarea
                id="mistakes"
                placeholder="What mistakes did you make? What would you do differently? Rules violated?"
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
                rows={3}
                className="bg-gray-800/50 border-gray-700 focus:border-yellow-500 text-gray-100 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="strategy" className="text-base font-semibold text-gray-200 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Strategy & Execution Notes
              </Label>
              <Textarea
                id="strategy"
                placeholder="What was your strategy? Setup? Entry/exit criteria? Did you follow your plan?"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                rows={3}
                className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-gray-100 resize-none"
              />
            </div>
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-200 flex items-center gap-2">
              <Camera className="h-4 w-4 text-green-400" />
              Screenshots & Charts
            </Label>
            <div className="space-y-3">
              <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-700 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-800/30 hover:bg-gray-800/50">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-400">Upload chart screenshots or setup images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              {screenshots.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {screenshots.map((screenshot, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={screenshot} 
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
          >
            Save Journal Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
