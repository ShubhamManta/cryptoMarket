import type { Candle, SymbolQuote } from "./types";

export const symbols: SymbolQuote[] = [
  { symbol: "225JPY", bid: "60395", ask: "60400", spread: 5, tone: "down" },
  { symbol: "BTC-USD", bid: "76686.23", ask: "76691.77", spread: 554, tone: "flat" },
  { symbol: "ETH-USD", bid: "2260.96", ask: "2262.04", spread: 108, tone: "up" },
  { symbol: "USOUSD", bid: "94.4", ask: "94.44", spread: 4 },
  { symbol: "XAUAUD", bid: "5672.7", ask: "5673", spread: 3, tone: "up" },
  { symbol: "XRP-USD", bid: "1.26581", ask: "1.26679", spread: 98 },
];

export const categories = ["All", "Forex", "Stocks", "Crypto", "Indices", "Comm"] as const;
export type Category = (typeof categories)[number];

export const timeframes = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y", "All"] as const;

// Seeded mock candles. Replace with your API / WebSocket data.
export function makeCandles(n = 60, start = 76100): Candle[] {
  let p = start;
  let s = 7;
  const rnd = (): number => ((s = (s * 9301 + 49297) % 233280) / 233280 - 0.5);
  return Array.from({ length: n }, (_, t) => {
    const o = p;
    const c = o + rnd() * 120 + 8;
    const h = Math.max(o, c) + Math.abs(rnd()) * 60;
    const l = Math.min(o, c) - Math.abs(rnd()) * 60;
    p = c;
    return { t, o, h, l, c };
  });
}