import type { AppDispatch } from "../store";

import {
  updatePrices,
  setConnectionStatus,
  setError,
  INITIAL_SYMBOLS,
} from "../slices/cryptoSlice";
import type { CryptoPrice } from "../slices/cryptoSlice";

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

const SOCKET_BASE = "wss://stream.binance.com:9443/stream?streams=";

// "BTCUSDT" -> "btcusdt@ticker"  (Binance allows up to 1024 streams per connection)
const buildSocketUrl = (symbols: string[]): string =>
  SOCKET_BASE + symbols.map((s) => `${s.toLowerCase()}@ticker`).join("/");

export class CryptoWebSocket {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private isActive = false;
  private readonly maxReconnectDelay = 30000;

  // ticks are buffered and sent to Redux in one batch instead of ~100 dispatches/sec
  private buffer = new Map<string, CryptoPrice>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly flushInterval = 250;

  private dispatch: AppDispatch;
  private readonly url: string;

  constructor(dispatch: AppDispatch, symbols: string[] = INITIAL_SYMBOLS) {
    this.dispatch = dispatch;
    this.url = buildSocketUrl(symbols);
  }

  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.connect();
  }

  private flush(): void {
    this.flushTimer = null;

    if (this.buffer.size === 0) return;

    const batch = Array.from(this.buffer.values());
    this.buffer.clear();
    this.dispatch(updatePrices(batch));
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
      const socket = new WebSocket(this.url);
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

          // keep the full symbol ("BTCUSDT") so it matches the keys in the slice
          this.buffer.set(ticker.s, {
            symbol: ticker.s,
            price: ticker.c,
            change24h: ticker.P,
            volume24h: ticker.q,
            lastUpdated: Date.now(),
          });

          if (!this.flushTimer) {
            this.flushTimer = setTimeout(() => this.flush(), this.flushInterval);
          }
        } catch (error) {
          console.error("WebSocket parsing error:", error);
        }
      };

      socket.onerror = (event) => {
        console.error("Crypto WebSocket error:", event);
      };

      socket.onclose = (event) => {
        console.log("Crypto WebSocket closed:", event.code, event.reason);

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

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.buffer.clear();

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