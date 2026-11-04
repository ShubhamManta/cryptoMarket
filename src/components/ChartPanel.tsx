import { useState } from "react";
import dynamic from "next/dynamic";
import { timeframes } from "@/utils/data";
import { useAppSelector, getPriceBySymbol } from "@/store/index";

const AmChart = dynamic(() => import("./amchart"), { ssr: false });

interface ChartPanelProps {
  symbol?: string;
}

export default function ChartPanel({ symbol = "BTCUSDT" }: ChartPanelProps) {
  const [activeTf, setActiveTf] = useState<string>("1m");
  const liveData = useAppSelector((state) => getPriceBySymbol(state, symbol));

  const price = liveData?.price ? parseFloat(liveData.price) : 0;
  const change = liveData?.change24h ? parseFloat(liveData.change24h) : 0;
  const isUp = change >= 0;

  return (
    <section className="panel chart">

      <div className="chart-legend">
        <b className="sym">● {symbol}</b>
        <span>
          Price:{" "}
          <b className={isUp ? "green-t" : "red-t"}>
            {price > 0 ? price.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "—"}
          </b>
          {"  "}
          24h:{" "}
          <span className={isUp ? "green-t" : "red-t"}>
            {change !== 0 ? `${isUp ? "+" : ""}${change.toFixed(2)}%` : "0.00%"}
          </span>
          {liveData?.volume24h && (
            <span style={{ marginLeft: "12px", opacity: 0.8 }}>
              Vol: {parseFloat(liveData.volume24h).toFixed(2)}
            </span>
          )}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: "360px", width: "100%", position: "relative" }}>
        <AmChart symbol={symbol} />
      </div>

      <div className="range">
        {timeframes.map((t) => (
          <button
            key={t}
            className={t === activeTf ? "tab on" : ""}
            onClick={() => setActiveTf(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </section>
  );
}
