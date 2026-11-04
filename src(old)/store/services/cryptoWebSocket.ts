
import type { AppDispatch } from "../store";

import {
  updatePrices,
  setConnectionStatus,
  setError,
} from "../slices/cryptoSlice";

interface BinanceTicker {
  s: string;
  c: string;
  P: string;
  q: string;
}

interface BinanceMessage {
  stream: string;
  data: BinanceTicker;
}

const SOCKET_URL =
  "wss://stream.binance.com:9443/stream?streams=" +
  [
    "btcusdt@ticker",
    "ethusdt@ticker",
    "solusdt@ticker",
    "bnbusdt@ticker",
    "xrpusdt@ticker",
  ].join("/");

export class CryptoWebSocket {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private isActive = false;
  private readonly maxReconnectDelay = 30000;

  private dispatch: AppDispatch;

  constructor(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.connect();
  }

  private connect(): void {
    if (!this.isActive) return;

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.dispatch(setConnectionStatus("connecting"));
    this.dispatch(setError(null));

    try {
      const socket = new WebSocket(SOCKET_URL);
      this.socket = socket;

      socket.onopen = () => {
        if (!this.isActive || this.socket !== socket) {
          socket.close();
          return;
        }

        this.reconnectAttempts = 0;

        this.dispatch(setConnectionStatus("connected"));
        this.dispatch(setError(null));

        console.log("Crypto WebSocket connected");
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        if (!this.isActive || this.socket !== socket) return;

        try {
          const message: BinanceMessage = JSON.parse(event.data);

          if (!message.data?.s) return;

          const ticker = message.data;

          this.dispatch(
            updatePrices([
              {
                symbol: ticker.s.replace("USDT", ""),
                price: ticker.c,
                change24h: ticker.P,
                volume24h: ticker.q,
                lastUpdated: Date.now(),
              },
            ])
          );
        } catch (error) {
          console.error("WebSocket parsing error:", error);
        }
      };

      socket.onerror = (event) => {
        console.error("Crypto WebSocket error:", event);
      };

      socket.onclose = (event) => {
        console.log(
          "Crypto WebSocket closed:",
          event.code,
          event.reason
        );

        if (this.socket === socket) {
          this.socket = null;
        }

        if (!this.isActive) return;

        this.dispatch(setConnectionStatus("disconnected"));
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error("WebSocket initialization error:", error);

      this.dispatch(setConnectionStatus("disconnected"));
      this.dispatch(setError("Unable to initialize WebSocket"));

      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.isActive || this.reconnectTimer) return;

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    this.reconnectAttempts++;

    console.log(`Reconnecting in ${delay / 1000} seconds`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  disconnect(): void {
    this.isActive = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const socket = this.socket;
    this.socket = null;

    if (socket) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (
        socket.readyState === WebSocket.CONNECTING ||
        socket.readyState === WebSocket.OPEN
      ) {
        socket.close(1000, "Client disconnect");
      }
    }

    this.dispatch(setConnectionStatus("disconnected"));

    console.log("Crypto WebSocket disconnected");
  }
}
