"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Watchlist from "@/components/Watchlist";
import ChartPanel from "@/components/ChartPanel";
import OrderPanel from "@/components/OrderPanel";
import AiInsights from "@/components/AiInsights";
import PositionsPanel from "@/components/PositionsPanel";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { selectSymbols } from "@/store/slices/cryptoSlice";
import { CryptoWebSocket } from "@/store/services/cryptoWebSocket";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const symbols = useAppSelector(selectSymbols) as string[];
  const [selected, setSelected] = useState<string>("BTCUSDT");

  useEffect(() => {
    if (symbols.length === 0) return;

    const socket = new CryptoWebSocket(dispatch, symbols);
    socket.start();

    return () => socket.disconnect();
  }, [dispatch, symbols]);

  return (
    <div className="app">
      <Header />
      <div className="body">
        <Sidebar />
        <div className="grid">
          <Watchlist
            allSymbols={symbols}
            selected={selected}
            onSelect={setSelected}
          />
          <ChartPanel symbol={selected} />
          <div className="right-col">
            <OrderPanel symbol={selected} onSubmit={(o) => console.log("order", o)} />
            <AiInsights />
          </div>
          <PositionsPanel />
        </div>
      </div>
    </div>
  );
}

