"use client";

// import { useState } from "react";
// import { categories, type Category } from "@/utils/data";
import type { Tone } from "@/utils/types";
import { useAppSelector, getPrices } from "@/store/index";
// import { Plus, SlidersHorizontal } from "lucide-react";

export type Quote = { bid: string; ask: string; spread: string; tone?: Tone };

interface WatchlistProps {
  allSymbols: string[];
  quotes?: Record<string, Quote>;
  selected?: string;
  onSelect?: (symbol: string) => void;
}

const bidClass = (t?: Tone): string =>
  t === "down" ? "red" : t === "up" ? "green" : t === "flat" ? "grey" : "";
const askClass = (t?: Tone): string =>
  t === "down" ? "red" : t === "up" || t === "flat" ? "green" : "";

export default function Watchlist({
  allSymbols,
  quotes = {},
  selected,
  onSelect,
}: WatchlistProps) {
  const prices = useAppSelector(getPrices);
  
  return (
    <section className="panel watchlist">
      

      {/* Quotes Table */}
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: "left", paddingLeft: "8px" }}>Symbol</th>
            <th style={{ textAlign: "center" }}>Bid</th>
            <th style={{ textAlign: "center" }}>Ask</th>
            <th style={{ textAlign: "right", paddingRight: "10px" }}>Spread</th>
          </tr>
        </thead>
        <tbody>
          {allSymbols.map((symbol) => {
            const q = quotes[symbol];
            const live = prices[symbol];

            const change = live ? parseFloat(live.change24h) : 0;
            const liveTone: Tone | undefined = live
              ? change > 0
                ? "up"
                : change < 0
                ? "down"
                : "flat"
              : undefined;

            const tone = q?.tone ?? liveTone;
            const bid =
              q?.bid ?? (live ? parseFloat(live.price).toFixed(2) : "—");
            const ask =
              q?.ask ??
              (live ? (parseFloat(live.price) * 1.0001).toFixed(2) : "—");
            const spread =
              q?.spread ??
              (live ? (parseFloat(live.price) * 0.0001).toFixed(2) : "—");

            return (
              <tr
                key={symbol}
                className={symbol === selected ? "sel" : ""}
                onClick={() => onSelect?.(symbol)}
              >
                <td
                  style={{
                    textAlign: "left",
                    paddingLeft: "8px",
                    fontWeight: 600,
                    letterSpacing: "0.2px",
                  }}
                >
                  {symbol}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className={`quote ${bidClass(tone)}`}>{bid}</span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className={`quote ${askClass(tone)}`}>{ask}</span>
                </td>
                <td
                  style={{
                    textAlign: "right",
                    paddingRight: "10px",
                    fontFamily: '"JetBrains Mono", monospace',
                    color: "var(--muted)",
                  }}
                >
                  {spread}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
