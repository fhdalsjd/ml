import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ENTRIES = [
  {
    n: "01",
    title: "Every trade, logged",
    body: "Entries, exits, size and P&L land in the ledger automatically the moment a position closes — nothing typed twice.",
  },
  {
    n: "02",
    title: "MT5 syncs itself",
    body: "Connect MetaTrader 5 once. The sync client pulls closed and open positions into your journal in the background.",
  },
  {
    n: "03",
    title: "The numbers that matter",
    body: "Win rate, profit factor, Sharpe ratio, and a calendar of daily P&L — read at a glance, not assembled by hand.",
  },
  {
    n: "04",
    title: "What you were thinking",
    body: "Attach the emotion, the mistake, the reasoning behind every trade, so the pattern shows up before the losing streak does.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <span className="text-xl font-display italic text-foreground">Ledger</span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/register">
              <Button size="sm">Open a journal</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-b border-border bg-ledger">
        <div className="container mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
          <div>
            <p className="font-mono text-xs text-primary mb-5 tabular-nums">
              Trade journal — est. for traders who review their work
            </p>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-foreground">
              Keep the record
              <br />
              your trading deserves.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              A ledger for every position you take — synced from MT5, scored against
              your own history, and honest about the trades you'd rather forget.
            </p>
            <div className="mt-9 flex items-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start your ledger <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          <EquityMark />
        </div>
      </div>

      {/* Entries — a numbered ledger, not a card grid */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-xl mb-14">
          <h2 className="font-display text-3xl text-foreground">What goes in the ledger</h2>
        </div>
        <div className="divide-y divide-border border-t border-b border-border">
          {ENTRIES.map((entry) => (
            <div key={entry.n} className="grid md:grid-cols-[80px_1fr_1.4fr] gap-4 md:gap-10 py-8">
              <span className="font-mono text-sm text-muted-foreground tabular-nums">{entry.n}</span>
              <h3 className="font-display text-xl text-foreground">{entry.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-md">{entry.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing */}
      <div className="border-t border-border">
        <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="font-display text-2xl text-foreground max-w-sm">
            Your next trade is only as good as your last review.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Open a journal <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-6 text-xs text-muted-foreground font-mono">
          Ledger — a trading journal
        </div>
      </footer>
    </div>
  );
}

function EquityMark() {
  // A single drawn equity line — the one orchestrated motion moment on the page.
  const path =
    "M0,150 L30,145 L60,155 L90,130 L120,140 L150,100 L180,115 L210,80 L240,95 L270,60 L300,75 L330,40 L360,55 L390,20 L420,35 L450,10";
  return (
    <div className="relative rounded-sm border border-border bg-card p-6">
      <div className="flex items-baseline justify-between mb-6">
        <span className="font-mono text-xs text-muted-foreground">EQUITY CURVE</span>
        <span className="font-mono text-sm text-green-400 tabular-nums">+18.4%</span>
      </div>
      <svg viewBox="0 0 450 170" className="w-full h-auto overflow-visible" fill="none">
        <line x1="0" y1="150" x2="450" y2="150" stroke="hsl(var(--border))" strokeWidth="1" />
        <path
          d={path}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1000"
          strokeDasharray="1000"
          className="animate-draw-line"
        />
        <circle cx="450" cy="10" r="3.5" fill="hsl(var(--primary))" />
      </svg>
      <div className="mt-6 grid grid-cols-3 gap-4 pt-5 border-t border-border font-mono text-sm tabular-nums">
        <div>
          <div className="text-muted-foreground text-xs mb-1">Win rate</div>
          <div className="text-foreground">64.2%</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs mb-1">Profit factor</div>
          <div className="text-foreground">2.1</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs mb-1">Trades</div>
          <div className="text-foreground">312</div>
        </div>
      </div>
    </div>
  );
}
