export type RangeKey = "1D" | "3D" | "7D" | "1M" | "3M" | "6M" | "1Y";
export const RANGES: RangeKey[] = ["1D", "3D", "7D", "1M", "3M", "6M", "1Y"];
export const RANGE_DAYS: Record<RangeKey, number> = { "1D": 1, "3D": 3, "7D": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365 };

export interface EquityPoint { label: string; equity: number; balance: number; pnl: number; realised: number; unrealised: number; lots: number }
export interface DailyPnl { date: string; label: string; pnl: number; trades: number; lots: number; wins: number }
export interface AnalyticsData {
  range: RangeKey;
  summary: { totalPnl: number; winRate: number; trades: number; profitFactor: number; maxDrawdown: number; maxDrawdownPct: number; sharpe: number };
  equity: EquityPoint[];
  daily: DailyPnl[];
  monthly: { label: string; pnl: number }[];
  performance: { winners: number; losers: number; winRate: number; lots: number; avgHold: string; direction: { side: "Long" | "Short"; trades: number; pnl: number }[] };
  instruments: { pair: string; trades: number; pnl: number }[];
  closed: { overallRealised: number; todayPnl: number };
  transactions: { type: string; count: number; amount: number }[];
  grossProfit: number; grossLoss: number; avgWin: number; avgLoss: number;
  health: { score: number; status: "Healthy" | "Stable" | "At risk"; risk: "Low" | "Medium" | "High"; note: string };
}
export interface CalendarDay {
  pnl: number; trades: number; grossProfit: number; grossLoss: number; long: number; short: number;
  profitFactor: number; sharpe: number; avgHold: string; maxDD: number; balance: number;
}
export interface AnalyticsState {
  range: RangeKey;
  data: AnalyticsData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  calendarMonth: string;
  calendar: Record<string, CalendarDay>;
  calendarStatus: "idle" | "loading" | "succeeded" | "failed";
}

export const analyticsInitialState: AnalyticsState = {
  range: "1Y",         
  data: null,
  status: "idle",
  calendarMonth: "",
  calendar: {},
  calendarStatus: "idle",
};

const START_BALANCE = 10000;
const PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "DOGEUSDT"];
const r2 = (n: number) => Math.round(n * 100) / 100;
const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const holdStr = (mins: number) => (mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`);
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function buildAnalytics(range: RangeKey): AnalyticsData {
  const days = RANGE_DAYS[range];
  const rand = mulberry32(days * 7919 + 13);
  const today = new Date(); today.setHours(0, 0, 0, 0);

 
  const daily: DailyPnl[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (days - 1 - i));
    const trades = 1 + Math.floor(rand() * 9);
    return {
      date: ymd(d), label: fmtDay(d), trades,
      pnl: r2((rand() - 0.4) * 420),
      lots: r2(trades * (0.1 + rand() * 0.4)),
      wins: Math.min(trades, Math.round(trades * (0.35 + rand() * 0.4))),
    };
  });

 
  const hourly = days <= 3;
  const n = hourly ? days * 24 : days;
  const now = Date.now();
  let balance = START_BALANCE;
  const equity: EquityPoint[] = Array.from({ length: n }, (_, i) => {
    const t = new Date(now - (n - 1 - i) * (hourly ? 3600e3 : 86400e3));
    balance += hourly ? (rand() - 0.4) * 60 : daily[i].pnl;
    const unrealised = (rand() - 0.5) * 150;
    return {
      label: hourly ? `${fmtDay(t)} ${String(t.getHours()).padStart(2, "0")}:00` : fmtDay(t),
      balance: r2(balance), unrealised: r2(unrealised), equity: r2(balance + unrealised),
      realised: r2(balance - START_BALANCE), pnl: r2(balance - START_BALANCE + unrealised),
      lots: r2(rand() * 3),
    };
  });

 
  const totalPnl = r2(daily.reduce((s, d) => s + d.pnl, 0));
  const trades = daily.reduce((s, d) => s + d.trades, 0);
  const winners = daily.reduce((s, d) => s + d.wins, 0);
  const losers = trades - winners;
  const grossProfit = r2(daily.filter((d) => d.pnl > 0).reduce((s, d) => s + d.pnl, 0));
  const grossLoss = r2(Math.abs(daily.filter((d) => d.pnl < 0).reduce((s, d) => s + d.pnl, 0)));
  const profitFactor = grossLoss ? r2(grossProfit / grossLoss) : grossProfit ? 99 : 0;
  const winRate = trades ? r2((winners / trades) * 100) : 0;

  let peak = -Infinity, maxDrawdown = 0, maxDrawdownPct = 0;
  equity.forEach((p) => {
    peak = Math.max(peak, p.balance);
    const dd = peak - p.balance;
    if (dd > maxDrawdown) { maxDrawdown = dd; maxDrawdownPct = (dd / peak) * 100; }
  });
  const mean = totalPnl / days;
  const std = Math.sqrt(daily.reduce((s, d) => s + (d.pnl - mean) ** 2, 0) / days);
  const sharpe = std ? r2((mean / std) * Math.sqrt(252)) : 0;

 
  const mr = mulberry32(42);
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
    return { label: d.toLocaleDateString("en-US", { month: "short" }), pnl: r2((mr() - 0.4) * 2600) };
  });

 
  const longTrades = Math.round(trades * 0.55);
  const instruments = PAIRS.map((pair) => ({ pair, trades: 0, pnl: 0 }));
  let left = trades;
  instruments.forEach((p, i) => {
    const t = i === instruments.length - 1 ? left : Math.floor(left * (0.2 + rand() * 0.25));
    p.trades = t; left -= t; p.pnl = r2((rand() - 0.35) * t * 40);
  });
  instruments.sort((a, b) => b.trades - a.trades);

  const lots = r2(daily.reduce((s, d) => s + d.lots, 0));
  const health = (() => {
    const score = Math.max(0, Math.min(100, Math.round(40 + winRate * 0.35 + Math.min(profitFactor, 3) * 8 - maxDrawdownPct * 0.6)));
    const status = score >= 75 ? "Healthy" : score >= 50 ? "Stable" : "At risk";
    const risk = maxDrawdownPct < 5 ? "Low" : maxDrawdownPct < 12 ? "Medium" : "High";
    const note = `Win rate is ${winRate.toFixed(1)}% with a profit factor of ${profitFactor.toFixed(2)} across ${trades} trades. Max drawdown reached ${maxDrawdownPct.toFixed(1)}% in this period.`;
    return { score, status, risk, note } as AnalyticsData["health"];
  })();

  return {
    range,
    summary: { totalPnl, winRate, trades, profitFactor, maxDrawdown: r2(maxDrawdown), maxDrawdownPct: r2(maxDrawdownPct), sharpe },
    equity, daily, monthly,
    performance: {
      winners, losers, winRate, lots, avgHold: holdStr(20 + Math.floor(rand() * 400)),
      direction: [
        { side: "Long", trades: longTrades, pnl: r2(totalPnl * 0.6) },
        { side: "Short", trades: trades - longTrades, pnl: r2(totalPnl * 0.4) },
      ],
    },
    instruments,
    closed: { overallRealised: totalPnl, todayPnl: daily[daily.length - 1].pnl },
    transactions: [
      { type: "Trade P&L", count: trades, amount: totalPnl },
      { type: "Commission", count: trades, amount: -r2(trades * 0.45) },
      { type: "Funding fee", count: Math.floor(days * 0.8), amount: -r2(days * 0.8 * 1.2) },
      { type: "Deposit", count: Math.max(1, Math.floor(days / 30)), amount: START_BALANCE },
      { type: "End of day margin", count: days, amount: 0 },
    ],
    grossProfit, grossLoss,
    avgWin: winners ? r2(grossProfit / winners) : 0,
    avgLoss: losers ? r2(grossLoss / losers) : 0,
    health,
  };
}

export function buildCalendarMonth(year: number, month: number): Record<string, CalendarDay> {
  const out: Record<string, CalendarDay> = {};
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const last = new Date(year, month + 1, 0).getDate();
  let balance = START_BALANCE + (year * 12 + month) % 7 * 300;
  for (let day = 1; day <= last; day++) {
    const d = new Date(year, month, day);
    if (d > today) break;
    const rand = mulberry32(year * 10000 + (month + 1) * 100 + day);
    if (rand() < 0.28) continue;
    const trades = 1 + Math.floor(rand() * 9);
    const long = Math.round(trades * rand());
    const gp = r2(rand() * 520), gl = r2(rand() * 380);
    balance = r2(balance + gp - gl);
    out[ymd(d)] = {
      pnl: r2(gp - gl), trades, grossProfit: gp, grossLoss: gl, long, short: trades - long,
      profitFactor: gl ? r2(gp / gl) : gp ? 99 : 0, sharpe: r2((rand() - 0.3) * 3),
      avgHold: holdStr(10 + Math.floor(rand() * 300)), maxDD: r2(rand() * 220), balance,
    };
  }
  return out;
}